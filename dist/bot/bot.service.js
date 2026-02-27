import 'dotenv/config';
import { Telegraf, Markup, session } from 'telegraf';
import { bookingDeletedResponses, bookingsFoundResponses, bookingSuccessMessages, bookingUpdatedResponses, finalSuccessMessage, incorrectNameResponses, incorrectPhoneResponses, incorrectSeatsResponses, nameRequestMessages, noAvailableSeatsMessages, noBookingsResponses, noEventSelectedMessages, phoneRequestMessages, seatsRequestMessages, selectEventMessages, welcomeMessage, } from '../api/messages.api.js';
import { getRandomMessage, validatePositiveNumber, validateGuestName, validatePhoneNumber, updateBookingRows, addNewBooking, deleteBookingRow, filterByXMarkInPartyName, } from '../api/bookings.api.js';
import { getSheetsProperties, getAllSheetsData, } from '../sheets/sheets.repo.js';
//helpers
// === Inline клавиатура с галочками ===
function createInlineKeyboard(optionsMap, selectedOptions) {
    const buttons = Array.from(optionsMap.values()).map((opt) => ({
        text: selectedOptions.includes(opt.index) ? `✅ ${opt.title}` : opt.title,
        callback_data: `select_${opt.index}`,
    }));
    const inlineKeyboard = buttons.map((btn) => [btn]);
    inlineKeyboard.push([
        { text: '‼️ Завершить выбор ‼️', callback_data: 'finish_selection' },
    ]);
    return { reply_markup: { inline_keyboard: inlineKeyboard } };
}
// --- Конфигурация
const BOT_TOKEN = process.env.BOT_TOKEN;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const GS_URL = process.env.GS_URL;
const bot = new Telegraf(BOT_TOKEN);
bot.use(session());
// --- Главное меню
const mainMenu = Markup.keyboard([
    ['Забронировать'],
    ['Проверить бронь', 'Изменить бронь'],
    ['Отменить бронь', 'Начать заново'],
]).resize();
// --- Старт
bot.start((ctx) => {
    ctx.session = {};
    ctx.replyWithHTML(welcomeMessage, mainMenu);
});
bot.hears('Начать заново', (ctx) => {
    ctx.session = {};
    ctx.replyWithHTML(welcomeMessage, mainMenu);
});
// --- Забронировать
bot.hears('Забронировать', (ctx) => {
    ctx.session = { step: 'input_phone', action: 'reserve', selectedOptions: [] };
    ctx.reply(getRandomMessage(phoneRequestMessages));
});
// --- Проверка брони
bot.hears('Проверить бронь', async (ctx) => {
    ctx.session = { step: 'input_phone', action: 'check' }; // используем action "check"
    ctx.reply(getRandomMessage(phoneRequestMessages));
});
// --- Отмена бронирования
bot.hears('Отменить бронь', async (ctx) => {
    ctx.session = { step: 'input_phone', action: 'delete', selectedOptions: [] };
    await ctx.reply(getRandomMessage(phoneRequestMessages));
});
// --- Изменение бронирования
bot.hears('Изменить бронь', async (ctx) => {
    ctx.session = { step: 'input_phone', action: 'edit', selectedOptions: [] };
    await ctx.reply(getRandomMessage(phoneRequestMessages));
});
bot.on('text', async (ctx) => {
    if (!ctx.session) {
        await ctx.reply('⚠️ Сессия сброшена. Начнем заново.', mainMenu);
        return;
    }
    const state = ctx.session;
    if (!state.step)
        return;
    const text = ctx.message.text.trim();
    //
    //
    //
    switch (state.step) {
        case 'input_phone':
            if (!validatePhoneNumber(text))
                return ctx.reply(getRandomMessage(incorrectPhoneResponses));
            state.phone = text;
            await ctx.replyWithSticker('CAACAgIAAxkBAAIJHWdEIT91AAHXkLWFFzYJaX9QKTIoWwAC6V0AAunBIEqsMOs8iagxVTYE');
            // const loadMsg = await ctx.reply('⏳ Загружаем данные...');
            // const msgId = loadMsg.message_id;
            // let progress = 0;
            // const barLen = 6;
            // const animateLoad = setInterval(async () => {
            //   progress += Math.floor(Math.random() * 10);
            //   if (progress > 100) progress = 100;
            //   const filled = Math.floor((progress / 100) * barLen);
            //   const bar = '🟩'.repeat(filled) + '⬛'.repeat(barLen - filled);
            //   try {
            //     await ctx.telegram.editMessageText(
            //       ctx.chat!.id,
            //       msgId,
            //       undefined,
            //       `⏳ Загрузка данных: ${bar} ${progress}%`,
            //     );
            //   } catch {}
            //   if (progress >= 100) clearInterval(animateLoad);
            // }, 500);
            const sheetProperties = await getSheetsProperties(SPREADSHEET_ID);
            state.allTablesData = await getAllSheetsData(SPREADSHEET_ID, sheetProperties);
            state.allTablesData = filterByXMarkInPartyName(state.allTablesData);
            const userBookings = state.allTablesData.filter((sheet) => sheet.bookings.some((record) => record.phone === state.phone));
            if (userBookings.length === 0) {
                // // no bookings
                // // --- delete progress bar message
                // try {
                //   await ctx.telegram.deleteMessage(ctx.chat!.id, msgId);
                // } catch (e) {
                //   console.warn('⚠️ Не удалось удалить сообщение:', e);
                // }
                if (state.action === 'delete' ||
                    state.action === 'check' ||
                    state.action === 'edit') {
                    await ctx.reply(getRandomMessage(noBookingsResponses), mainMenu);
                    ctx.session = {};
                    return;
                }
            }
            // --- create map for inline-buttons
            state.optionsForSelect = new Map();
            userBookings.forEach((sheet) => {
                const totalSeats = sheet.bookings.reduce((sum, record) => record.phone === state.phone ? sum + Number(record.seats) : sum, 0);
                state.optionsForSelect?.set(sheet.sheetId, {
                    index: sheet.sheetId,
                    title: state.action === 'edit'
                        ? `${sheet.partyName} - ${totalSeats} мест`
                        : sheet.partyName,
                    availableSeats: sheet.availableSeats,
                    currentSeats: totalSeats || 0,
                    hookah: sheet.availableHookah || 0,
                    suggestTable: sheet.suggestTable,
                    tableCost: sheet.tableCost,
                    tables: sheet.availableTables,
                });
            });
            state.step = 'select_party';
            if (userBookings.length > 0 &&
                (state.action === 'reserve' || state.action === 'check')) {
                let msg = `${getRandomMessage(bookingsFoundResponses)}\n`;
                for (const sheet of userBookings) {
                    const totalSeats = sheet.bookings.reduce((sum, record) => record.phone === state.phone ? sum + Number(record.seats) : sum, 0);
                    msg += `• ${sheet.partyName} — ${totalSeats.toString()} мест\n`;
                }
                await ctx.reply(msg);
            }
            // --- Удаляем сообщение с прогресс-баром
            // try {
            //   await ctx.telegram.deleteMessage(ctx.chat!.id, msgId);
            // } catch (e) {
            //   console.warn('⚠️ Не удалось удалить сообщение:', e);
            // }
            const selectableSheets = state.allTablesData.filter((sheet) => !userBookings.some((record) => record.sheetName === sheet.sheetName));
            // --- Отправляем inline-кнопки отдельно
            if (state.action === 'delete' || state.action === 'edit') {
                await ctx.reply(getRandomMessage(bookingsFoundResponses), createInlineKeyboard(state.optionsForSelect, state.selectedOptions));
            }
            else if (state.action === 'check') {
                ctx.session = {};
                return;
            }
            else {
                // Доступные для брони (даже если мест нет)
                const freeSheets = selectableSheets.filter((sheet) => {
                    return !userBookings.some((record) => record.sheetName === sheet.sheetName);
                });
                if (freeSheets.length === 0) {
                    ctx.reply(getRandomMessage(noAvailableSeatsMessages), mainMenu);
                    ctx.session = {};
                    return;
                }
                state.optionsForSelect = new Map();
                freeSheets.forEach((sheet) => {
                    state.optionsForSelect?.set(sheet.sheetId, {
                        index: sheet.sheetId,
                        title: sheet.partyName,
                        availableSeats: sheet.availableSeats,
                        currentSeats: 0,
                        hookah: sheet.availableHookah,
                        suggestTable: sheet.suggestTable,
                        tableCost: sheet.tableCost,
                        tables: sheet.availableTables,
                    });
                });
                await ctx.reply(getRandomMessage(selectEventMessages), createInlineKeyboard(state.optionsForSelect, state.selectedOptions));
            }
            break;
        // === 2. Ввод имени ===
        case 'input_name':
            if (!validateGuestName(text)) {
                return ctx.reply(getRandomMessage(incorrectNameResponses));
            }
            state.name = text;
            state.step = 'input_places';
            ctx.reply(getRandomMessage(seatsRequestMessages));
            break;
        // === 3. Ввод количества мест и добавление в таблицу ===
        case 'input_places':
            if (state.action === 'edit') {
                const placesNum = parseInt(text);
                if (!validatePositiveNumber(placesNum)) {
                    getRandomMessage(incorrectSeatsResponses).replace('MAXSEATS', '');
                }
                let maxAvailable = 155;
                for (const sheetId of state.selectedOptions) {
                    const option = state.optionsForSelect?.get(sheetId);
                    if (option) {
                        maxAvailable = Math.min(maxAvailable, Number(option.availableSeats) + option.currentSeats);
                    }
                }
                if (placesNum > maxAvailable) {
                    return ctx.reply(getRandomMessage(incorrectSeatsResponses).replace('MAXSEATS', maxAvailable.toString()));
                }
                state.places = placesNum;
                if (state.places === 2) {
                    let tableCost;
                    const canSuggestTable = state.selectedOptions?.every((sheetId) => {
                        const option = state.optionsForSelect?.get(sheetId);
                        tableCost = option?.tableCost;
                        return option && option.suggestTable && option.tables > 0;
                    });
                    if (canSuggestTable) {
                        state.step = 'input_table';
                        return ctx.reply(`Желаете расположиться за столом вдвоём? Доплата ${tableCost} рублей за стол.`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: 'Да', callback_data: 'table_yes' }],
                                    [{ text: 'Нет', callback_data: 'table_no' }],
                                ],
                            },
                        });
                    }
                }
                // Проверяем доступность кальяна
                const hookahAvailable = state.selectedOptions?.every((sheetId) => {
                    const option = state.optionsForSelect?.get(sheetId);
                    return option && Number(option.hookah) > 0;
                });
                if (hookahAvailable) {
                    state.step = 'input_hookah';
                    return ctx.reply('Хотите заказать кальян?', {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Да', callback_data: 'hookah_yes' }],
                                [{ text: 'Нет', callback_data: 'hookah_no' }],
                            ],
                        },
                    });
                }
                // Если кальян недоступен, устанавливаем hookah = false и отправляем обновление
                state.hookah = false;
                try {
                    await updateBookingRows(SPREADSHEET_ID, ctx, state);
                    ctx.reply(getRandomMessage(bookingUpdatedResponses));
                    ctx.session = {};
                }
                catch (error) {
                    console.log(error);
                }
                return;
            }
            const placesNum = parseInt(text);
            if (!validatePositiveNumber(placesNum)) {
                getRandomMessage(incorrectSeatsResponses).replace('MAXSEATS', '');
            }
            let maxAvailable = 155;
            for (const sheetId of state.selectedOptions) {
                const option = state.optionsForSelect?.get(sheetId);
                if (option) {
                    maxAvailable = Math.min(maxAvailable, Number(option.availableSeats) + option.currentSeats);
                }
            }
            if (placesNum > maxAvailable) {
                return ctx.reply(getRandomMessage(incorrectSeatsResponses).replace('MAXSEATS', maxAvailable.toString()));
            }
            state.places = placesNum;
            if (state.places === 2) {
                let tableCost;
                const canSuggestTable = state.selectedOptions?.every((sheetId) => {
                    const option = state.optionsForSelect?.get(sheetId);
                    tableCost = option?.tableCost;
                    return option && option.suggestTable && option.tables > 0;
                });
                if (canSuggestTable) {
                    state.step = 'input_table';
                    return ctx.reply(`Желаете расположиться за столом вдвоём? Доплата ${tableCost} рублей за стол.`, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Да', callback_data: 'table_yes' }],
                                [{ text: 'Нет', callback_data: 'table_no' }],
                            ],
                        },
                    });
                }
            }
            // Проверяем доступность кальяна
            const hookahAvailable = state.selectedOptions?.every((sheetId) => {
                const option = state.optionsForSelect?.get(sheetId);
                return option && Number(option.hookah) > 0;
            });
            if (hookahAvailable) {
                state.step = 'input_hookah';
                return ctx.reply('Хотите заказать кальян?', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Да', callback_data: 'hookah_yes' }],
                            [{ text: 'Нет', callback_data: 'hookah_no' }],
                        ],
                    },
                });
            }
            // Если кальян недоступен, устанавливаем hookah = false и отправляем обновление
            state.hookah = false;
            try {
                await addNewBooking(SPREADSHEET_ID, ctx, state);
                ctx.replyWithSticker('CAACAgIAAxkBAAIJ_mdEY7JQtx_hqkGl5023DkZ9pWdYAAIMYgACuyMYShJp1N-PPHrRNgQ');
                ctx.reply(`${getRandomMessage(bookingSuccessMessages)}\n\n${finalSuccessMessage}`, mainMenu);
                ctx.replyWithDocument({
                    source: 'assets/rules.pdf',
                    filename: 'Правила посещения клуба.pdf',
                });
                ctx.session = {};
            }
            catch (error) {
                console.log(error);
            }
            break;
    }
});
bot.action(/hookah_(yes|no)/, async (ctx) => {
    if (!ctx.session) {
        await ctx.reply('⚠️ Сессия сброшена. Начнем заново.', mainMenu);
        return;
    }
    const choice = ctx.match[1]; // "yes" или "no"
    const state = ctx.session;
    if (state.step !== 'input_hookah') {
        return ctx.answerCbQuery('Это действие уже не актуально');
    }
    // Сохраняем в state
    ctx.session.hookah = choice === 'yes';
    // Удаляем сообщение с кнопками
    await ctx.answerCbQuery();
    try {
        await ctx.deleteMessage();
    }
    catch { }
    // Продолжаем процесс бронирования или обновления
    try {
        if (state.action === 'edit') {
            await updateBookingRows(SPREADSHEET_ID, ctx, state);
            ctx.reply(getRandomMessage(bookingUpdatedResponses));
            ctx.session = {};
        }
        else {
            await addNewBooking(SPREADSHEET_ID, ctx, state);
            ctx.replyWithSticker('CAACAgIAAxkBAAIJ_mdEY7JQtx_hqkGl5023DkZ9pWdYAAIMYgACuyMYShJp1N-PPHrRNgQ');
            ctx.reply(`${getRandomMessage(bookingSuccessMessages)}\n\n${finalSuccessMessage}`, mainMenu);
            ctx.replyWithDocument({
                source: 'assets/rules.pdf',
                filename: 'Правила посещения клуба.pdf',
            });
            ctx.session = {};
        }
    }
    catch (error) {
        console.log(error);
    }
});
bot.action(/table_(yes|no)/, async (ctx) => {
    if (!ctx.session) {
        await ctx.reply('⚠️ Сессия сброшена. Начнем заново.', mainMenu);
        return;
    }
    const state = ctx.session;
    if (state.step !== 'input_table') {
        return ctx.answerCbQuery('Это действие уже не актуально');
    }
    const choice = ctx.match[1];
    state.isTableForTwo = choice === 'yes';
    await ctx.answerCbQuery();
    try {
        await ctx.deleteMessage();
    }
    catch { }
    // ✅ Проверяем доступность кальяна
    const hookahAvailable = state.selectedOptions?.every((sheetId) => {
        const option = state.optionsForSelect?.get(sheetId);
        return option && Number(option.hookah) > 0;
    });
    if (hookahAvailable) {
        state.step = 'input_hookah';
        return ctx.reply('Хотите заказать кальян?', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Да', callback_data: 'hookah_yes' }],
                    [{ text: 'Нет', callback_data: 'hookah_no' }],
                ],
            },
        });
    }
    // если кальяна нет
    state.hookah = false;
    try {
        if (state.action === 'edit') {
            await updateBookingRows(SPREADSHEET_ID, ctx, state);
            ctx.reply(getRandomMessage(bookingUpdatedResponses));
            ctx.session = {};
        }
        else {
            await addNewBooking(SPREADSHEET_ID, ctx, state);
            ctx.replyWithSticker('CAACAgIAAxkBAAIJ_mdEY7JQtx_hqkGl5023DkZ9pWdYAAIMYgACuyMYShJp1N-PPHrRNgQ');
            ctx.reply(`${getRandomMessage(bookingSuccessMessages)}\n\n${finalSuccessMessage}`, mainMenu);
            ctx.replyWithDocument({
                source: 'assets/rules.pdf',
                filename: 'Правила посещения клуба.pdf',
            });
            ctx.session = {};
        }
    }
    catch (error) {
        console.log(error);
    }
});
bot.action(/^select_(\d+)$/, async (ctx) => {
    if (!ctx.session) {
        await ctx.reply('⚠️ Сессия сброшена. Давайте начнем сначала.', mainMenu);
        return;
    }
    const state = ctx.session;
    state.selectedOptions ??= [];
    const idx = parseInt(ctx.match[1]);
    if (!state.optionsForSelect)
        return;
    if (state.selectedOptions.includes(idx))
        state.selectedOptions = state.selectedOptions.filter((i) => i !== idx);
    else
        state.selectedOptions.push(idx);
    await ctx.editMessageReplyMarkup(createInlineKeyboard(state.optionsForSelect, state.selectedOptions)
        .reply_markup);
    await ctx.answerCbQuery();
});
bot.action('finish_selection', async (ctx) => {
    if (!ctx.session) {
        await ctx.reply('⚠️ Сессия сброшена. Начнем заново.', mainMenu);
        return;
    }
    const state = ctx.session;
    if (!state.selectedOptions || state.selectedOptions.length === 0) {
        return ctx.answerCbQuery(getRandomMessage(noEventSelectedMessages), {
            show_alert: true,
        });
    }
    if (state.action === 'delete') {
        await deleteBookingRow(SPREADSHEET_ID, ctx, state);
        await ctx.editMessageText(getRandomMessage(bookingDeletedResponses));
        ctx.session = {};
        return;
    }
    const selectedTitles = Array.from(state.optionsForSelect.values())
        .filter((option) => state.selectedOptions?.includes(option.index))
        .map((option) => option.title);
    if (state.action === 'reserve') {
        const unavailable = state.selectedOptions.filter((sheetId) => {
            const option = state.optionsForSelect?.get(sheetId);
            return !option || Number(option.availableSeats) <= 0;
        });
        if (unavailable.length > 0) {
            const titles = unavailable
                .map((id) => state.optionsForSelect?.get(id)?.title)
                .filter(Boolean)
                .join(', ');
            await ctx.answerCbQuery();
            await ctx.reply(`К сожалению, на мероприятие(я) ${titles} нет мест для регистрации. Выберите другое событие.`);
            return;
        }
    }
    state.step = 'input_name';
    await ctx.editMessageText(`Вы выбрали: ${selectedTitles.join(', ')}`);
    await ctx.reply(getRandomMessage(nameRequestMessages));
    await ctx.answerCbQuery();
});
bot.catch((err, ctx) => {
    console.error('🚨 Глобальная ошибка в боте:', err);
    ctx.reply('⚠️ Что-то пошло не так при соединении с сервером. Попробуйте еще раз пожалуйста.');
});
bot.launch().then(() => console.log('Бот запущен 🚀'));
