"use strict";
//ERRORS FOR GS API
const ERRORS = {
    NO_SEATS: {
        ok: false,
        type: 'NO_SEATS',
        message: 'Не укуазаны места',
    },
    NOT_FOUND: {
        ok: false,
        type: 'NOT_FOUND',
        message: 'Данных не найдено',
    },
    NO_PHONE: {
        ok: false,
        type: 'NO_PHONE',
        message: 'Не указан телефон',
    },
    NO_SHEET_ID: {
        ok: false,
        type: 'NO_SHEET_ID',
        message: 'Sheet ID не указан либо с таким ID не найден',
    },
    SEATS_CHANGED: {
        ok: false,
        type: 'SEATS_CHANGED',
        message: 'В момент бронирования такое количество мест стало недоступно',
    },
    DUPLICATE: {
        ok: false,
        type: 'DUPLICATE',
        message: 'Заявка существует',
    },
};
//
function renameSheets() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = spreadsheet.getSheets();
    sheets.forEach((sheet) => {
        const sheetName = sheet.getName();
        if (sheetName.includes(':')) {
            // Убираем двоеточия или заменяем их на дефис
            const newName = sheetName.replace(/:/g, '.');
            try {
                sheet.setName(newName);
                Logger.log(`Лист "${sheetName}" переименован в "${newName}".`);
            }
            catch (e) {
                Logger.log(`Не удалось переименовать лист "${sheetName}": ${e.message}`);
            }
        }
    });
}
function onEdit(e) {
    const sheet = e.source.getActiveSheet(); // Получаем активный лист
    const cellFormula = sheet.getRange('H3'); // Ячейка с формулой
    const cellText = sheet.getRange('H2'); // Ячейка с текстом
    const defaultFormula = '=SUM(D:D)'; // Формула для G3
    const defaultText = 'Итого:'; // Текст для G2
    const backgroundColor = '#addedb'; // Цвет фона
    const textAlignment = 'center'; // Выравнивание текста
    // Проверяем и восстанавливаем текст в G2
    if (cellText.getValue() !== defaultText) {
        cellText.setValue(defaultText);
    }
    // Проверяем и восстанавливаем формулу в G3
    if (cellFormula.getFormula() !== defaultFormula) {
        cellFormula.setFormula(defaultFormula);
    }
    // Применяем стиль для G2 и G3
    [cellText, cellFormula].forEach((cell) => {
        cell.setHorizontalAlignment(textAlignment); // Выравнивание текста по центру
        cell.setBackground(backgroundColor); // Устанавливаем цвет фона
    });
    const cache = CacheService.getScriptCache();
    // Проверяем, когда последний раз обновляли
    const lastUpdate = Number(cache.get('lastUpdate') || 0);
    const now = Date.now();
    // Если прошло меньше 30 секунд — не обновляем
    if (now - lastUpdate < 30000) {
        return;
    }
    cache.put('lastUpdate', String(now), 30000);
    refreshCache();
    Logger.log('Cache updated');
}
function refreshCache() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetsAll = ss.getSheets();
    const sheets = sheetsAll.slice(0, -2);
    const result = [];
    sheets.forEach((sheet) => {
        const party = sheet.getRange('H1').getValue();
        if (party.includes('❌')) {
            console.log('❌');
            return;
        }
        const values = sheet.getDataRange().getValues();
        if (values.length < 2)
            return;
        const rows = values.slice(1);
        const data = rows
            .map((row) => ({
            date: formatCell(row[0], ss),
            name: formatCell(row[1], ss),
            phone: formatCell(row[2], ss),
            seats: formatCell(row[3], ss),
            nickname: formatCell(row[4], ss),
            needHookah: formatCell(row[5], ss),
        }))
            .filter((obj) => Object.values(obj).some((v) => String(v).trim() !== ''));
        if (data.length > 0) {
            result.push({
                sheetName: sheet.getName(),
                sheetId: sheet.getSheetId(),
                party: formatCell(sheet.getRange('H1').getValue(), ss),
                available: formatCell(sheet.getRange('L1').getValue(), ss),
                hookah: formatCell(sheet.getRange('N1').getValue(), ss),
                data: data,
            });
        }
    });
    Logger.log(`Cache updated: ${result}`);
    const payload = JSON.stringify(result);
    const cache = CacheService.getScriptCache();
    cache.put('allSheets', payload, 300); // обновляем на 5 минут
}
//----------------------------------------------------------------------------------------------
/**
 * GET-запрос — получение данных
 * Параметры:
 *   phone (необязательно) — фильтр по номеру телефона
 *   pretty=1 (необязательно) — красивый JSON
 */
function doGet(e) {
    const cache = CacheService.getScriptCache();
    const cached = cache.get('allSheets');
    if (cached) {
        return ContentService.createTextOutput(cached).setMimeType(ContentService.MimeType.JSON);
    }
    // если кэша нет — пересчитать "вручную" (на случай первого запроса)
    refreshCache();
    const newCache = cache.get('allSheets');
    return ContentService.createTextOutput(newCache || '[]').setMimeType(ContentService.MimeType.JSON);
}
/**
 * POST-запрос — add / delete / update
 */
function doPost(e) {
    const lock = LockService.getDocumentLock();
    lock.waitLock(30000);
    try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const payload = JSON.parse(e.postData.contents);
        const bookings = Array.isArray(payload.bookings)
            ? payload.bookings
            : [payload];
        const results = [];
        bookings.forEach((record) => {
            try {
                Logger.log(record);
                const sheet = ss.getSheetById(record.sheetId);
                if (!sheet)
                    throw { ...ERRORS.NO_SHEET_ID };
                const values = sheet.getDataRange().getValues();
                let available = Number(sheet.getRange('L1').getValue());
                if (record.action === 'delete') {
                    if (!record.phone)
                        throw { ...ERRORS.NO_PHONE };
                    let deletedCount = 0;
                    for (let i = values.length - 1; i > 0; i--) {
                        if (String(values[i][2]).trim() === record.phone.trim()) {
                            sheet.deleteRow(i + 1);
                            deletedCount++;
                        }
                    }
                    results.push({ sheetId: record.sheetId, ok: true, deletedCount });
                }
                else if (record.action === 'update') {
                    if (!record.phone)
                        throw { ...ERRORS.NO_PHONE };
                    if (!record.seats)
                        throw { ...ERRORS.NO_SEATS };
                    let updatedCount = 0;
                    for (let i = 1; i < values.length; i++) {
                        if (String(values[i][2]).trim() === record.phone.trim()) {
                            available =
                                available + Number(sheet.getRange(i + 1, 4).getValue());
                            if (record.seats > available)
                                throw { ...ERRORS.SEATS_CHANGED, available };
                            sheet.getRange(i + 1, 4).setValue(record.seats);
                            if (Number(record.hookah) === 1) {
                                sheet.getRange(i + 1, 6).setValue(1);
                            }
                            else {
                                sheet.getRange(i + 1, 6).setValue('');
                            }
                            updatedCount++;
                        }
                    }
                    results.push({ sheetId: record.sheetId, ok: true, updatedCount });
                }
                else {
                    // add
                    if (!record.phone)
                        throw { ...ERRORS.NO_PHONE };
                    if (!record.seats)
                        throw { ...ERRORS.NO_SEATS };
                    const exist = values.some((row) => row[1] === record.name &&
                        String(row[2]) === String(record.phone) &&
                        row[3] === Number(record.seats) &&
                        row[5] === Number(record.hookah));
                    if (exist)
                        throw { ...ERRORS.DUPLICATE };
                    if (record.seats > available)
                        throw { ...ERRORS.SEATS_CHANGED, available };
                    const newRow = [
                        record.date || '',
                        record.name || '',
                        record.phone || '',
                        record.seats || '',
                        record.nickname || '',
                        record.hookah || '',
                    ];
                    sheet.appendRow(newRow);
                    results.push({ sheetId: record.sheetId, ok: true });
                }
            }
            catch (err) {
                const error = err instanceof Error
                    ? { ok: false, type: 'INTERNAL_ERROR', message: err.message }
                    : err;
                results.push({ sheetId: record.sheetId, ...error });
            }
        });
        return ContentService.createTextOutput(JSON.stringify(results)).setMimeType(ContentService.MimeType.JSON);
    }
    catch (err) {
        Logger.log(err);
        const response = err instanceof Error
            ? { ok: false, type: 'INTERNAL_ERROR', message: err.message }
            : err;
        return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
    }
    finally {
        try {
            refreshCache(); // обновляем кэш всех листов
        }
        catch (cacheErr) {
            Logger.log('Ошибка при обновлении кэша: ' + cacheErr.message);
        }
        lock.releaseLock();
    }
}
function testSheetID() {
    const ss = SpreadsheetApp.getActiveSpreadsheet().getSheets();
    ss.forEach((shet) => Logger.log(shet.getSheetId()));
    Logger.log(SpreadsheetApp.getActiveSpreadsheet().getSheetById(1807414179));
}
/**
 * Форматирование ячеек: дата → строка, пустые → ""
 */
function formatCell(value, ss) {
    if (value === null || value === undefined)
        return '';
    if (Object.prototype.toString.call(value) === '[object Date]' &&
        !isNaN(value.getTime())) {
        const tz = ss.getSpreadsheetTimeZone
            ? ss.getSpreadsheetTimeZone()
            : Session.getScriptTimeZone();
        return Utilities.formatDate(value, tz, 'yyyy-MM-dd HH:mm:ss');
    }
    return String(value);
}
