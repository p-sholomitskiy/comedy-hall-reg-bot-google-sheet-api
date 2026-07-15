import { sheetsClient } from '../google/sheets.client.js';
import { DATA_RANGE_COUNT, DataCells, } from './sheets.types.js';
import { START_APPEND_COL, START_UPDATE_COL, END_COL, } from './sheets.constants.js';
export async function getSheetsProperties(spreadsheetId) {
    const response = await sheetsClient.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets.properties(sheetId,title)',
    });
    return (response.data.sheets
        ?.map((sheet) => sheet.properties)
        .filter((props) => props !== undefined) ?? []);
}
function escapeSheetTitle(title) {
    const safe = title.replace(/'/g, "''");
    return `'${safe}'`;
}
export async function getAllSheetsData(spreadsheetId, sheets) {
    const ranges = [];
    for (const { title } of sheets) {
        const sheetName = escapeSheetTitle(title || '');
        ranges.push(`${sheetName}!${DataCells.PARTY_NAME}`);
        ranges.push(`${sheetName}!${DataCells.AVAILABLE_SEATS}`);
        ranges.push(`${sheetName}!${DataCells.SUGGEST_HOOKAH}`);
        ranges.push(`${sheetName}!${DataCells.AVAILABLE_HOOKAH}`);
        ranges.push(`${sheetName}!${DataCells.SUGGEST_TABLE}`);
        ranges.push(`${sheetName}!${DataCells.AVAILABLE_TABLES}`);
        ranges.push(`${sheetName}!${DataCells.TABLE_COST}`);
        ranges.push(`${sheetName}!${DataCells.BOOKINGS}`);
    }
    const response = await sheetsClient.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges,
    });
    const valueRanges = response.data.valueRanges ?? [];
    const result = [];
    for (let i = 0; i < sheets.length; i++) {
        const base = i * DATA_RANGE_COUNT;
        const [titleCell, seatsCell, suggestHookahCell, hookahCell, suggestTableCell, tableCell, tableCostCell, rowsRange,] = valueRanges.slice(base, base + DATA_RANGE_COUNT);
        const { sheetId, title } = sheets[i];
        const partyName = titleCell?.values?.[0]?.[0] ?? '';
        const seats = Number(seatsCell?.values?.[0]?.[0] ?? 0);
        const suggestHookah = suggestHookahCell?.values?.[0]?.[0] === 'TRUE';
        const hookah = Number(hookahCell?.values?.[0]?.[0] ?? 0);
        const suggestTable = suggestTableCell?.values?.[0]?.[0] === 'TRUE';
        const tableCost = Number(tableCostCell?.values?.[0]?.[0] ?? 0);
        const tables = Number(tableCell?.values?.[0]?.[0] ?? 0);
        const rows = rowsRange?.values ?? [];
        const mappedRows = rows.map((record) => {
            return {
                date: record[0],
                name: record[1],
                phone: record[2],
                seats: record[3],
                nickname: record[4],
                isHookahNeeded: record[5] ? true : false,
                isForTwo: record[6] ? true : false,
            };
        });
        result.push({
            spreadsheetId,
            sheetId: sheetId || 0,
            sheetName: title || '',
            partyName,
            availableSeats: seats,
            availableHookah: hookah,
            suggestHookah,
            suggestTable,
            tableCost,
            availableTables: tables,
            bookings: mappedRows,
        });
    }
    return result;
}
export async function batchUpdateRowsByMap(spreadsheetId, titlesToRowNumber, newValues) {
    const data = [];
    for (const [sheetTitle, rowNumberInSheet] of titlesToRowNumber.entries()) {
        if (rowNumberInSheet < 0)
            continue; // пропускаем -1
        const rowNumber = rowNumberInSheet;
        const range = `${escapeSheetTitle(sheetTitle)}!${START_UPDATE_COL}${rowNumber}:${END_COL}${rowNumber}`;
        data.push({
            range,
            values: [newValues],
        });
    }
    if (!data.length)
        return;
    await sheetsClient.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
            valueInputOption: 'USER_ENTERED',
            data,
        },
    });
}
export async function appendRowToSheets(spreadsheetId, sheetTitles, rowValues) {
    await Promise.all(sheetTitles.map(async ([sheetId, title]) => {
        const appendResponse = await sheetsClient.spreadsheets.values.append({
            spreadsheetId,
            range: `${escapeSheetTitle(title)}!${START_APPEND_COL}:${END_COL}`, // или твой BOOKINGS диапазон
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: [rowValues],
            },
        });
        const updatedRange = appendResponse.data.updates?.updatedRange; // "Sheet1!A5:B5"
        const rowMatch = updatedRange?.match(/![A-Z]+(\d+):/);
        const rowNumber = rowMatch ? Number(rowMatch[1]) : undefined;
        await sheetsClient.spreadsheets.batchUpdate({
            spreadsheetId, // ⚠️ обязательно на уровне метода, а не внутри requestBody
            requestBody: {
                requests: [
                    {
                        repeatCell: {
                            range: {
                                sheetId,
                                startRowIndex: rowNumber - 1, // 0-based
                                endRowIndex: rowNumber,
                            },
                            cell: {
                                userEnteredFormat: {
                                    backgroundColor: undefined,
                                    textFormat: undefined,
                                },
                            },
                            fields: 'userEnteredFormat(backgroundColor,textFormat)',
                        },
                    },
                ],
            },
        });
    }));
}
/**
 * sheetsMeta: массив метаданных листов (title + sheetId)
 * titlesToRowIndex: Map<sheetTitle, rowIndexInSheet> (0-based, -1 если нет)
 */
export async function batchDeleteRowsByMap(spreadsheetId, sheetsData, titlesToRowIndex) {
    const requests = [];
    for (const { sheetName, sheetId } of sheetsData) {
        const rowIndexInSheet = titlesToRowIndex.get(sheetName) || -1;
        if (rowIndexInSheet == null || rowIndexInSheet < 0)
            continue;
        requests.push({
            deleteDimension: {
                range: {
                    sheetId,
                    dimension: 'ROWS',
                    startIndex: rowIndexInSheet - 1,
                    endIndex: rowIndexInSheet,
                },
            },
        });
    }
    if (!requests.length)
        return;
    await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests },
    });
}
// export async function getSheetAllData()
