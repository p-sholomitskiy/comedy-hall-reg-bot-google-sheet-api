"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const welcomeMessage = `Здравствуйте!

      Здесь Вы можете забронировать места или отменить бронирование на мероприятия в Stand Up Comedy Hall.

      Для этого ответьте, пожалуйста, на вопросы бота.

      ‼️ Обратите внимание, что бот автоматический, поэтому здороваться с ним не требуется 😁

      ВНИМАНИЕ! ВАЖНАЯ ИНФОРМАЦИЯ!

      ❗️ Обращаем Ваше внимание, что Вы бронируете места за столиком либо за барной стойкой ( места выбираются по факту прихода или распределяются администратором. Для компании от четырех человек закрепляется столик, что гарантирует, что Ваша компания будет сидеть вместе)
      ❗️ Места за столиком рассчитаны на 4-х человек, поэтому просим Вас дружелюбно отнестись к возможной подсадке и гостям рядом с Вами. Надеемся на Ваше понимание и позитивное настроение.
      ❗️ Для Вашего комфорта просим приходить МИНИМУМ за 20 минут до начала шоу, это позволит Вам комфортно расположиться, а также сделать заказ и пообщаться с нашими барменами🍸🍹
      ‼️Оплата брони происходит по факту прихода ( картой, наличными)

      С мероприятиями клуба можно ознакомиться:
      ✩ Instagram: https://www.instagram.com/standupcomedyhall/
      ✩ Telegram: https://t.me/standupcomedyhall

      Ждем Вас в гости ! 🤗

      С уважением,
      Stand Up Comedy Hall ❤️`;
const phoneRequestMessages = [
    "Пожалуйста, введите ваш номер телефона в формате: 375XXXXXXXXX или 79XXXXXXXXX. 📞",
    "Нам нужен ваш номер телефона для продолжения. Введите его в формате: 375XXXXXXXXX или 79XXXXXXXXX. 📱",
    "Укажите номер телефона в формате: 375XXXXXXXXX или 79XXXXXXXXX, чтобы мы могли продолжить. ☎️",
    "Введите ваш номер телефона, пожалуйста, в формате: 375XXXXXXXXX или 79XXXXXXXXX. 🔢",
    "Укажите номер телефона, пожалуйста, в формате: 375XXXXXXXXX или 79XXXXXXXXX. Без него мы не справимся. 🤖",
    "Нам нужен Ваш номер телефона, чтобы всё получилось. Напишите его в формате: 375XXXXXXXXX или 79XXXXXXXXX! 📲",
    "Укажите номер телефона в формате: 375XXXXXXXXX или 79XXXXXXXXX, чтобы мы могли Вам помочь. 👇",
    "Укажите номер телефона, пожалуйста, в формате: 375XXXXXXXXX или 79XXXXXXXXX. Иначе мы не сможем двигаться дальше! 🚶‍♂️",
    "Пожалуйста, укажите ваш номер телефона в формате: 375XXXXXXXXX или 79XXXXXXXXX. 📇",
    "Введите номер телефона в формате: 375XXXXXXXXX или 79XXXXXXXXX, чтобы мы могли принять бронь. 🗒",
];
const incorrectPhoneResponses = [
    "Этот номер выглядит странно. Проверьте его, пожалуйста! 🙃",
    "Упс, кажется, это не телефон. Попробуйте снова! ❌",
    "Что-то не так с номером. Убедитесь, что формат верный. 🔢",
    "Номер телефона не распознан. Проверьте и введите его ещё раз. 📵",
    "Этот номер нам не подходит. Попробуйте другой формат. 🔄",
    "Похоже, в номере ошибка. Убедитесь, что вы всё ввели правильно. 🛑",
    "Номер телефона не соответствует формату. Проверьте его, пожалуйста! 🧐",
    "Что-то не так с этим номером. Попробуйте ещё раз. ☎️",
    "Номер выглядит подозрительно. Пожалуйста, проверьте его внимательнее. 😬",
    "Вероятно, это не номер телефона. Проверьте формат и отправьте снова. 🔍",
];
const nameRequestMessages = [
    "Как вас зовут? Напишите, пожалуйста, Ваше имя. Оно должно содержать только буквы. 📝",
    "Введите Ваше имя, чтобы мы могли к Вам обращаться. Пожалуйста, без цифр и специальных символов. 😊",
    "Нам нужно Ваше имя для продолжения. Укажите его, пожалуйста, оно должно состоять только из букв. 🙋‍♂️",
    "Как нам Вас называть? Укажите Ваше имя. Пожалуйста, без цифр и символов. 🖋️",
    "Пожалуйста, укажите Ваше имя для бронирования. Оно должно быть составлено только из букв. 📋",
    "Напишите своё имя, чтобы мы могли продолжить. Не используйте цифры или специальные символы. ✍️",
    "Пожалуйста, укажите Ваше имя для бронирования. Оно должно содержать только буквы  — без цифр и специальных символов. 😇",
    "Для продолжения нам необходимо Ваше имя. Введите его, пожалуйста, имя должно состоять только из букв. 🤗",
    "Введите своё имя, пожалуйста. Это займёт всего пару секунд! Помните, оно должно быть без цифр и символов. ⏳",
    "Как Вас зовут? Напишите имя в сообщении ниже. Убедитесь, что оно состоит только из букв. 💬",
];
const incorrectNameResponses = [
    "Хм, это точно имя? Напишите его ещё раз. 🤔",
    "Имя выглядит некорректно. Попробуйте ещё раз. ❌",
    "Похоже, вы допустили ошибку. Проверьте имя и введите его снова. 🧐",
    "Ваше имя не распознано. Напишите его правильно, пожалуйста. 🤷‍♂️",
    "Это странное имя. Проверьте, пожалуйста, перед отправкой. 🛑",
    "Имя выглядит неправильно. Попробуйте другой формат. ✍️",
    "Упс, кажется, в имени ошибка. Напишите его ещё раз. 😊",
    "Не могу понять ваше имя. Проверьте, пожалуйста. 🙃",
    "Что-то не так с вашим именем. Убедитесь, что всё верно. 🤖",
    "Это точно имя? Напишите его снова, пожалуйста. 🔄",
];
const seatsRequestMessages = [
    "Сколько мест вы хотите забронировать? Введите количество. 🔢",
    "Укажите количество мест, которое вы хотите забронировать. 🪑",
    "Напишите, сколько мест вам нужно. 🤔",
    "Сколько человек придёт? Введите количество. 👥",
    "Укажите, сколько мест бронировать. Это важно. 💺",
    "Напишите, сколько мест вам необходимо для бронирования. ✍️",
    "Укажите количество мест, пожалуйста. Напишите цифрой. 🔢",
    "Сколько мест бронируем? Напишите ответ ниже. 👇",
    "Укажите точное количество мест для брони. ✅",
    "Введите количество мест. Мы всё зафиксируем! 📋",
];
const incorrectSeatsResponses = [
    `Неверное число или количество мест превышает максимально доступное (Максимально доступное число: MAXSEATS). Попробуйте снова. 🤔`,
    `Укажите число мест (не больше MAXSEATS), доступных для бронирования. 🔢`,
    `Число указано неверно или количество мест превышает максимально доступное (Максимально доступное число: MAXSEATS). ❌`,
    `Количество мест должно быть от 1 до MAXSEATS. 🧐`,
    `Проверьте число. Доступно не больше MAXSEATS мест. 📉`,
    `Это не число или оно больше доступного (Максимально доступное число: MAXSEATS). 🔄`,
    `Мест слишком много или число неверно. Доступно максимум MAXSEATS мест. ✍️`,
    `Число не подходит. Доступно не более MAXSEATS мест. 🤷‍♂️`,
    `Укажите количество мест от 1 до MAXSEATS. Проверьте, пожалуйста. 🔢`,
    `Похоже, вы ошиблись. Доступно не больше MAXSEATS мест. ⏳`,
];
const bookingsFoundResponses = [
    "Найдены следующие бронирования: 📋",
    "Ваши актуальные бронирования: ✅",
    "Вот список ваших бронирований: 👇",
    "Мы нашли следующие записи: 🗂️",
    "Актуальные бронирования: 🔍",
    "Список активных бронирований: 📜",
    "Ваши бронирования найдены: 🎉",
    "Вот, что нам удалось найти: 🧐",
    "Найдено! Ваши бронирования: 📇",
    "Мы нашли записи, связанные с вами: ✨",
];
const noBookingsResponses = [
    "К сожалению, мы ничего не нашли. 🙁",
    "Записи не найдены. Попробуйте ещё раз позже. ❌",
    "Бронирования отсутствуют. Начните сначала. 🤷‍♂️",
    "Никаких бронирований не обнаружено. 🧐",
    "Мы не нашли записи с этим номером. 😓",
    "Бронирований пока нет. Попробуйте позже. ⏳",
    "Записей о бронированиях не найдено. 🔄",
    "Похоже, вы ничего не бронировали. 🙃",
    "К сожалению, бронирований пока нет. 🤔",
    "Мы ничего не нашли. Попробуйте сделать новое бронирование. 📝",
];
const bookingUpdatedResponses = [
    "Изменения успешно внесены. ✅",
    "Ваше бронирование обновлено! 🎉",
    "Мы внесли изменения в ваше бронирование. ✍️",
    "Обновление прошло успешно! 🛠️",
    "Ваши данные обновлены. Спасибо! 💾",
    "Все изменения сохранены. 📋",
    "Ваше бронирование теперь обновлено! 🔄",
    "Успех! Изменения зафиксированы. ✅",
    "Обновлено! Всё в порядке. 👍",
    "Мы обновили ваше бронирование. Наслаждайтесь! 🎊",
];
const bookingDeletedResponses = [
    "Бронирование успешно удалено. ❌",
    "Ваше бронирование удалено. Надеемся увидеть вас снова! 🙌",
    "Запись удалена. Всё чисто. 🧹",
    "Удаление прошло успешно! 👍",
    "Ваше бронирование больше не активно. ❌",
    "Мы удалили запись. Всё готово! 🗑️",
    "Удалено. Если передумаете, приходите снова. 🎉",
    "Ваше бронирование удалено. Спасибо, что сообщили! 🙏",
    "Успех! Запись удалена. 🔄",
    "Бронирование удалено. До новых встреч! 👋",
];
const selectEventMessages = [
    "Выберите одно или несколько мероприятий, а затем нажмите 'Завершить выбор'. 😊",
    "Вы можете выбрать одно или несколько мероприятий. После этого нажмите 'Завершить выбор'. 👍",
    "Пожалуйста, выберите одно или несколько мероприятий, а затем нажмите 'Завершить выбор'. 😌",
    "Вы можете выбрать несколько мероприятий. Не забудьте нажать 'Завершить выбор', когда будете готовы! 🧐",
    "Выберите одно или несколько мероприятий, а затем подтвердите свой выбор. 👌",
    "Нужно выбрать одно или несколько мероприятий, а потом нажать 'Завершить выбор'. 🎯",
    "Выберите несколько мероприятий, если нужно, и завершите выбор нажатием кнопки 'Завершить выбор'. ✅",
    "Пожалуйста, выберите одно или несколько мероприятий, а затем нажмите 'Завершить выбор', чтобы продолжить. 💡",
    "Выберите одно или несколько мероприятий, и не забудьте нажать 'Завершить выбор' в конце. 😉",
    "Вы можете выбрать столько мероприятий, сколько хотите! Когда будете готовы, нажмите 'Завершить выбор'. ✨",
];
const noAvailableSeatsMessages = [
    "К сожалению, на ближайшие мероприятия нет свободных мест. Возможно, они появятся позже! 😔",
    "Ой, похоже, на ближайшие мероприятия уже все забронировано. Возможно, места появятся позже! 😓",
    "Увы, все места на ближайшие мероприятия заняты. Может, появятся позже! 😉",
    "К сожалению, на ближайшие мероприятия нет мест. Возможно, что-то освободится позже! 😞",
    "Все места на ближайшие мероприятия уже заняты. Может, позже появятся свободные места! 🙁",
    "Похоже, на ближайшие мероприятия нет свободных мест. Но, возможно, они появятся позже! 😕",
    "Извините, на ближайшие мероприятия все места заняты. Возможно, позже что-то освободится! 😔",
    "На ближайшие мероприятия, к сожалению, нет мест. Возможно, позже что-то станет доступно! 😌",
    "Все места на ближайшие мероприятия уже забронированы. Но не переживайте, возможно, позже появятся места! 🤷‍♂️",
    "Увы, на ближайшие мероприятия мест больше нет. Возможно, позже что-то освободится. 😟",
];
const noEventSelectedMessages = [
    "Вы не выбрали ни одного мероприятия. Попробуйте снова! ❌",
    "Ой, кажется, вы забыли выбрать мероприятие. Пожалуйста, выберите хотя бы одно. 🤔",
    "Ни одного мероприятия не выбрано. Попробуйте выбрать что-то! 🧐",
    "Похоже, вы не выбрали мероприятие. Пожалуйста, выберите одно или несколько. 🙃",
    "Вы не выбрали ни одного мероприятия. Не забудьте выбрать хотя бы одно! 👀",
    "Упс, ничего не выбрано. Попробуйте выбрать мероприятия ниже. 👇",
    "Кажется, вы пропустили выбор. Выберите хотя бы одно мероприятие для продолжения. ✅",
    "Не выбрано ни одного мероприятия. Выберите, чтобы продолжить. 🧐",
    "Вы не выбрали никаких мероприятий. Пожалуйста, выберите что-то. 👈",
    "Ничего не выбрано. Пожалуйста, выберите хотя бы одно мероприятие. 🙄",
];
const bookingSuccessMessages = [
    "Всё прошло успешно! Ваше бронирование подтверждено. 🏆",
    "Ваше бронирование подтверждено! Всё прошло успешно. 🎉",
    "Поздравляем! Всё прошло успешно, Ваше бронирование подтверждено. ✅",
    "Ваше бронирование успешно подтверждено. Всё прошло отлично! 🏅",
    "Всё получилось! Ваше бронирование подтверждено. 📅",
    "Ваше бронирование успешно подтверждено. Всё прошло как по маслу! ✨",
    "Отлично! Всё прошло успешно, и ваше бронирование подтверждено. 🎟️",
    "Ваше бронирование успешно подтверждено. Всё прошло замечательно. 🔑",
    "Готово! Всё прошло успешно, Ваше бронирование подтверждено. 🎊",
    "Ваше бронирование подтверждено, всё прошло успешно. Поздравляем! 🥳",
];
const noSpamResponse = [
    "Пожалуйста, подождите немного. Идёт обработка предыдущей команды. ⏳",
    "Мы уже работаем над вашим запросом. Пожалуйста, не отправляйте команды слишком быстро. 🔄",
    "Идёт обработка, подождите немного. Мы скоро вернемся к вашему запросу! ⏳",
    "Не спамьте, пожалуйста! Мы уже работаем над вашим запросом. Пожалуйста, подождите. 🔄",
    "Ваш запрос в процессе! Подождите немного, прежде чем отправлять следующую команду. ⏳",
    "Пожалуйста, подождите, пока мы завершим текущую задачу. Не спамьте команды! 🕒",
    "Мы обрабатываем ваш запрос. Пожалуйста, подождите немного и не отправляйте команды подряд. 🔄",
    "Запрос в процессе! Пожалуйста, подождите, пока мы не закончим с предыдущей командой. ⏳",
    "Не переживайте, ваш запрос уже в работе! Пожалуйста, подождите немного. 🛠️",
    "Подождите, пожалуйста! Идет обработка предыдущей команды, не отправляйте команды слишком быстро. 🔄",
];
function getRandomMessage(messageAray) {
    return messageAray[Math.floor(Math.random() * messageAray.length)];
}
//
//
//
//
//
//
//
//
async function fetchWithTimeout(url, options = {}, timeout = 30000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(id);
        return response;
    }
    catch (err) {
        clearTimeout(id);
        throw new Error("⏱️ Сервер не ответил вовремя или произошла ошибка сети");
    }
}
require("dotenv/config");
const telegraf_1 = require("telegraf");
const sheetsCache = {
    data: null,
    timestamp: 0,
    ttl: 30000 // 15 секунд
};
async function getAllSheets() {
    const now = Date.now();
    // Если в кеше есть данные и TTL не истёк — вернуть кеш
    if (sheetsCache.data && now - sheetsCache.timestamp < sheetsCache.ttl) {
        return sheetsCache.data;
    }
    // Иначе — запрос
    const resp = await fetchWithTimeout(GS_URL, {}, 20000);
    const json = await resp.json();
    // Сохранить в кеш
    sheetsCache.data = json;
    sheetsCache.timestamp = now;
    return json;
}
// --- Конфигурация
const BOT_TOKEN = process.env.BOT_TOKEN;
const GS_URL = process.env.GS_URL;
const bot = new telegraf_1.Telegraf(BOT_TOKEN);
bot.use((0, telegraf_1.session)());
// --- Главное меню
const mainMenu = telegraf_1.Markup.keyboard([
    ["Забронировать"],
    ["Проверить бронь", "Изменить бронь"],
    ["Отменить бронь", "Начать заново"],
]).resize();
// --- Старт
bot.start((ctx) => {
    ctx.session = {};
    ctx.reply(welcomeMessage, mainMenu);
});
bot.hears("Начать заново", (ctx) => {
    ctx.session = {};
    ctx.reply(welcomeMessage, mainMenu);
});
// --- Забронировать
bot.hears("Забронировать", (ctx) => {
    ctx.session = { step: "input_phone", action: "reserve", selectedOptions: [] };
    ctx.reply(getRandomMessage(phoneRequestMessages));
});
// --- Проверка брони
bot.hears("Проверить бронь", async (ctx) => {
    ctx.session = { step: "input_phone", action: "check" }; // используем action "check"
    ctx.reply(getRandomMessage(phoneRequestMessages));
});
// --- Отмена бронирования
bot.hears("Отменить бронь", async (ctx) => {
    ctx.session = { step: "input_phone", action: "delete", selectedOptions: [] };
    await ctx.reply(getRandomMessage(phoneRequestMessages));
});
// --- Изменение бронирования
bot.hears("Изменить бронь", async (ctx) => {
    ctx.session = { step: "input_phone", action: "edit", selectedOptions: [] };
    await ctx.reply(getRandomMessage(phoneRequestMessages));
});
// --- Обработка текста
bot.on("text", async (ctx) => {
    if (!ctx.session) {
        await ctx.reply("⚠️ Сессия сброшена. Начнем заново.", mainMenu);
        return;
    }
    const state = ctx.session;
    if (!state.step)
        return;
    const text = ctx.message.text.trim();
    switch (state.step) {
        // === 1. Ввод телефона ===
        case "input_phone":
            if (!/^(\+?375\d{9}|\+?79\d{9})$/.test(text)) {
                return ctx.reply(getRandomMessage(incorrectPhoneResponses));
            }
            state.phone = text;
            // --- Отправка стикера
            await ctx.replyWithSticker("CAACAgIAAxkBAAIJHWdEIT91AAHXkLWFFzYJaX9QKTIoWwAC6V0AAunBIEqsMOs8iagxVTYE");
            // --- Прогресс-бар загрузки
            const loadMsg = await ctx.reply("⏳ Загружаем данные...");
            const msgId = loadMsg.message_id;
            let progress = 0;
            const barLen = 6;
            const animateLoad = setInterval(async () => {
                progress += Math.floor(Math.random() * 10);
                if (progress > 100)
                    progress = 100;
                const filled = Math.floor((progress / 100) * barLen);
                const bar = "🟩".repeat(filled) + "⬛".repeat(barLen - filled);
                try {
                    await ctx.telegram.editMessageText(ctx.chat.id, msgId, undefined, `⏳ Загрузка данных: ${bar} ${progress}%`);
                }
                catch { }
                if (progress >= 100)
                    clearInterval(animateLoad);
            }, 500);
            // // --- Получаем данные о бронированиях
            // const resp = await fetchWithTimeout(
            //   `${GS_URL}?phone=${state.phone}`,
            //   {},
            //   20000
            // );
            // const userBookings = await resp.json();
            const allSheets = await getAllSheets();
            // Брони этого пользователя
            const userBookings = allSheets.filter((sheet) => sheet.data.some((row) => row.phone === state.phone));
            clearInterval(animateLoad);
            if (userBookings.length === 0) {
                // Нет бронирований
                // --- Удаляем сообщение с прогресс-баром
                try {
                    await ctx.telegram.deleteMessage(ctx.chat.id, msgId);
                }
                catch (e) {
                    console.warn("⚠️ Не удалось удалить сообщение:", e);
                }
                if (state.action === "delete" ||
                    state.action === "check" ||
                    state.action === "edit") {
                    await ctx.reply(getRandomMessage(noBookingsResponses), mainMenu);
                    ctx.session = {};
                    return;
                }
            }
            // --- Создаём карту для inline-кнопок
            state.optionsForSelect = new Map();
            userBookings.forEach((b) => {
                const totalSeats = b.data.reduce((sum, row) => row.phone === state.phone ? sum + Number(row.seats) : sum, 0);
                state.optionsForSelect.set(b.sheetId, {
                    index: b.sheetId,
                    title: state.action === "edit"
                        ? `${b.party} — ${totalSeats} мест`
                        : b.party,
                    availableSeats: b.available,
                    currentSeats: totalSeats,
                });
            });
            state.step = "select_party";
            // --- Показываем текущие бронирования (только если есть)
            if (userBookings.length > 0 && (state.action === 'reserve' || state.action === 'check')) {
                let msg = `${getRandomMessage(bookingsFoundResponses)}\n`;
                for (const b of userBookings) {
                    const totalSeats = b.data.reduce((sum, row) => row.phone === state.phone ? sum + Number(row.seats) : sum, 0);
                    msg += `• ${b.party} — ${totalSeats} мест\n`;
                }
                await ctx.reply(msg);
            }
            // --- Удаляем сообщение с прогресс-баром
            try {
                await ctx.telegram.deleteMessage(ctx.chat.id, msgId);
            }
            catch (e) {
                console.warn("⚠️ Не удалось удалить сообщение:", e);
            }
            // // --- Доступные для выбора события
            // const availableSheets =
            //   state.action === "delete" || state.action === "edit"
            //   ? Array.from(state.optionsForSelect.values())
            //   : await getAllSheets();
            const availableSheets = allSheets.filter((sheet) => !userBookings.some((b) => b.sheetName === sheet.sheetName) && Number(sheet.available) > 0);
            // --- Отправляем inline-кнопки отдельно
            if (state.action === "delete" || state.action === "edit") {
                await ctx.reply(getRandomMessage(bookingsFoundResponses), createInlineKeyboard(state.optionsForSelect, state.selectedOptions));
            }
            else if (state.action === "check") {
                ctx.session = {};
                return;
            }
            else {
                // Доступные для брони 
                const freeSheets = availableSheets.filter((sheet) => {
                    const notBooked = !userBookings.some((b) => b.sheetName === sheet.sheetName);
                    const hasAvailableSeats = Number(sheet.available) > 0;
                    return notBooked && hasAvailableSeats;
                });
                if (freeSheets.length === 0) {
                    ctx.reply(getRandomMessage(noAvailableSeatsMessages), mainMenu);
                    ctx.session = {};
                    return;
                }
                state.optionsForSelect = new Map();
                freeSheets.forEach((s) => {
                    state.optionsForSelect.set(s.sheetId, {
                        index: s.sheetId,
                        title: s.party,
                        availableSeats: s.available,
                        currentSeats: 0
                    });
                });
                await ctx.reply(getRandomMessage(selectEventMessages), createInlineKeyboard(state.optionsForSelect, state.selectedOptions));
            }
            break;
        // === 2. Ввод имени ===
        case "input_name":
            if (!/^[A-Za-zА-Яа-яЁё\s'-]+$/.test(text)) {
                return ctx.reply(getRandomMessage(incorrectNameResponses));
            }
            state.name = text;
            state.step = "input_places";
            ctx.reply(getRandomMessage(seatsRequestMessages));
            break;
        // === 3. Ввод количества мест и добавление в таблицу ===
        case "input_places":
            if (state.action === "edit") {
                const placesNum = parseInt(text);
                if (isNaN(placesNum) || placesNum <= 0)
                    return ctx.reply(getRandomMessage(incorrectSeatsResponses).replace("MAXSEATS", ''));
                let maxAvailable = 155;
                for (const sheetId of state.selectedOptions) {
                    const option = state.optionsForSelect.get(sheetId);
                    console.log(option);
                    if (option) {
                        maxAvailable = Math.min(maxAvailable, Number(option.availableSeats) + option.currentSeats);
                    }
                }
                if (placesNum > maxAvailable) {
                    return ctx.reply(getRandomMessage(incorrectSeatsResponses).replace("MAXSEATS", maxAvailable.toString()));
                }
                // --- Анимация отправки изменений
                const sendMsg = await ctx.reply("📤 Отправляем изменения...");
                const sendId = sendMsg.message_id;
                let sendProgress = 0;
                const sendBarLen = 6;
                const sendTimer = setInterval(async () => {
                    sendProgress += Math.floor(Math.random() * 15);
                    if (sendProgress > 100)
                        sendProgress = 100;
                    const filled = Math.floor((sendProgress / 100) * sendBarLen);
                    const bar = "🟩".repeat(filled) + "⬛".repeat(sendBarLen - filled);
                    try {
                        await ctx.telegram.editMessageText(ctx.chat.id, sendId, undefined, `📤 Отправка изменений: ${bar} ${sendProgress}%`);
                    }
                    catch { }
                    if (sendProgress >= 100)
                        clearInterval(sendTimer);
                }, 500);
                // --- POST-запрос на обновление
                state.postRequestsErrors = [];
                const bookingsArray = state.selectedOptions.map(sheetId => ({
                    action: "update",
                    sheetId,
                    phone: state.phone,
                    seats: placesNum,
                }));
                const body = { bookings: bookingsArray };
                const resp = await fetchWithTimeout(GS_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                    redirect: "follow"
                }, 20000);
                const json = await resp.json(); // массив результатов
                console.log(body, json);
                sheetsCache.data = null;
                sheetsCache.timestamp = 0;
                // собираем ошибки по листам
                json.forEach((res) => {
                    if (!res.ok && res.type === 'SEATS_CHANGED') {
                        const title = state.optionsForSelect?.get(res.sheetId)?.title;
                        if (state.postRequestsErrors)
                            state.postRequestsErrors.push(`${title} - осталось ${res.available}`);
                    }
                });
                clearInterval(sendTimer);
                if (state.postRequestsErrors.length !== 0) {
                    const msg = `В момент бронирования на следующее мероприятие(я) количество доступных мест изменилось:\n${state.postRequestsErrors.join(',')}.\n Введите количество мест еще раз, пожалуйста.`;
                    await ctx.telegram.editMessageText(ctx.chat.id, sendId, undefined, msg);
                    ctx.session = {};
                    return;
                }
                await ctx.telegram.editMessageText(ctx.chat.id, sendId, undefined, getRandomMessage(bookingUpdatedResponses));
                ctx.session = {};
                return;
            }
            const placesNum = parseInt(text);
            if (isNaN(placesNum) || placesNum <= 0)
                return ctx.reply("Введите корректное число мест.");
            let maxAvailable = 155;
            for (const sheetId of state.selectedOptions) {
                const option = state.optionsForSelect.get(sheetId);
                if (option) {
                    maxAvailable = Math.min(maxAvailable, Number(option.availableSeats) + option.currentSeats);
                }
            }
            if (placesNum > maxAvailable) {
                return ctx.reply(getRandomMessage(incorrectSeatsResponses).replace("MAXSEATS", maxAvailable.toString()));
            }
            state.places = placesNum;
            // --- Анимация отправки брони
            const sendMsg = await ctx.reply("📤 Отправляем бронь...");
            const sendId = sendMsg.message_id;
            let sendProgress = 0;
            const sendBarLen = 6; // ✅ фиксируем длину прогресс-бара
            const sendTimer = setInterval(async () => {
                sendProgress += Math.floor(Math.random() * 15);
                if (sendProgress > 100)
                    sendProgress = 100;
                const filled = Math.floor((sendProgress / 100) * sendBarLen);
                const bar = "🟩".repeat(filled) + "⬛".repeat(sendBarLen - filled);
                try {
                    await ctx.telegram.editMessageText(ctx.chat.id, sendId, undefined, `📤 Отправка данных: ${bar} ${sendProgress}%`);
                }
                catch { }
                if (sendProgress >= 100)
                    clearInterval(sendTimer);
            }, 500);
            // --- POST запросы
            state.postRequestsErrors = [];
            const bookingsArray = state.selectedOptions.map(sheetId => ({
                sheetId,
                date: new Date().toLocaleString(),
                name: state.name,
                phone: state.phone,
                seats: state.places,
                nickname: ctx.from?.username || "",
            }));
            const body = { bookings: bookingsArray };
            const resp = await fetchWithTimeout(GS_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                redirect: "follow"
            }, 20000);
            const json = await resp.json(); // массив результатов
            console.log(body, json);
            sheetsCache.data = null;
            // собираем ошибки по листам
            json.forEach((res) => {
                if (!res.ok && res.type === 'SEATS_CHANGED') {
                    const title = state.optionsForSelect?.get(res.sheetId)?.title;
                    if (state.postRequestsErrors)
                        state.postRequestsErrors.push(`${title} - осталось ${res.available}`);
                }
            });
            clearInterval(sendTimer);
            if (state.postRequestsErrors.length !== 0) {
                const msg = `В момент бронирования на следующее мероприятие(я) количество доступных мест изменилось:\n${state.postRequestsErrors.join(',')}.\n Введите количество мест еще раз, пожалуйста.`;
                return ctx.reply(msg);
            }
            try {
                await ctx.telegram.deleteMessage(ctx.chat.id, sendId);
            }
            catch (e) {
                console.warn("⚠️ Не удалось удалить сообщение:", e);
            }
            ctx.replyWithSticker("CAACAgIAAxkBAAIJ_mdEY7JQtx_hqkGl5023DkZ9pWdYAAIMYgACuyMYShJp1N-PPHrRNgQ");
            ctx.reply(`${getRandomMessage(bookingSuccessMessages)}\n\nЕсли Ваши планы изменились, дайте нам знать любым удобным способом (мессенджеры, директ, или по телефону +375291129579). Также Вы можете отменить бронь самостоятельно с помощью бота.

‼️ Важно: все брони снимаются за 10 минут до начала мероприятия, пожалуйста, не опаздывайте ☺️

Ждем Вас по адресу ул. Кальварийская, 21.`, mainMenu);
            ctx.replyWithDocument({
                source: "assets/rules.pdf",
                filename: "Правила посещения клуба.pdf",
            });
            ctx.session = {};
            break;
    }
});
// === Inline клавиатура с галочками ===
function createInlineKeyboard(optionsMap, selectedOptions) {
    const buttons = Array.from(optionsMap.values()).map((opt) => ({
        text: selectedOptions.includes(opt.index) ? `✅ ${opt.title}` : opt.title,
        callback_data: `select_${opt.index}`,
    }));
    const inlineKeyboard = buttons.map((btn) => [btn]);
    inlineKeyboard.push([
        { text: "Завершить выбор ✅", callback_data: "finish_selection" },
    ]);
    return { reply_markup: { inline_keyboard: inlineKeyboard } };
}
// === Обработка выбора ===
bot.action(/^select_(\d+)$/, async (ctx) => {
    if (!ctx.session) {
        await ctx.reply("⚠️ Сессия сброшена. Давайте начнем сначала.", mainMenu);
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
// === Подтверждение выбора ===
bot.action("finish_selection", async (ctx) => {
    if (!ctx.session) {
        await ctx.reply("⚠️ Сессия сброшена. Начнем заново.", mainMenu);
        return;
    }
    const state = ctx.session;
    if (!state.selectedOptions || state.selectedOptions.length === 0) {
        return ctx.answerCbQuery(getRandomMessage(noEventSelectedMessages), {
            show_alert: true,
        });
    }
    if (state.action === "delete") {
        // Формируем массив для POST
        const bookingsArray = state.selectedOptions.map(sheetId => ({
            action: "delete",
            sheetId,
            phone: state.phone,
        }));
        const body = { bookings: bookingsArray };
        const resp = await fetchWithTimeout(GS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            redirect: "follow"
        }, 20000);
        const json = await resp.json(); // вернётся массив с результатами
        console.log(body, json);
        // Обновление кэша
        sheetsCache.data = null;
        sheetsCache.timestamp = 0;
        // Обработка ошибок по каждому листу
        state.postRequestsErrors = [];
        json.forEach((res) => {
            if (!res.ok && res.type === "SEATS_CHANGED") {
                const title = state.optionsForSelect?.get(res.sheetId)?.title;
                if (state.postRequestsErrors)
                    state.postRequestsErrors.push(`${title} - осталось ${res.available}`);
            }
        });
        await ctx.editMessageText(getRandomMessage(bookingDeletedResponses));
        ctx.session = {};
        return;
    }
    const selectedTitles = Array.from(state.optionsForSelect.values())
        .filter((opt) => state.selectedOptions.includes(opt.index))
        .map((opt) => opt.title);
    if (state.action === "edit") {
        state.step = "input_places"; // попросим ввести новое количество мест
        await ctx.editMessageText(`Вы выбрали для редактирования: ${selectedTitles.join(", ")}`);
        await ctx.reply(getRandomMessage(seatsRequestMessages));
        await ctx.answerCbQuery();
        return;
    }
    state.step = "input_name";
    await ctx.editMessageText(`Вы выбрали: ${selectedTitles.join(", ")}`);
    await ctx.reply(getRandomMessage(nameRequestMessages));
    await ctx.answerCbQuery();
});
bot.catch((err, ctx) => {
    console.error("🚨 Глобальная ошибка в боте:", err);
    ctx.reply("⚠️ Что-то пошло не так при соединении с сервером. Попробуйте еще раз пожалуйста.");
});
bot.launch().then(() => console.log("Бот запущен 🚀"));
