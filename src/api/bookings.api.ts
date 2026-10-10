import { MyContext, UserSession } from '../bot/bot.types.js';
import { BOOKINGS_START_ROW } from '../sheets/sheets.constants.js';
import {
  appendRowToSheets,
  batchDeleteRowsByMap,
  batchUpdateRowsByMap,
  getBookingRowsByPhone,
} from '../sheets/sheets.repo.js';
import { ISheetData } from '../sheets/sheets.types.js';

export function findRowsByPhone(phone: string, allSheets: ISheetData[]) {
  const mappedTitelWithRows = new Map<string, number>();
  for (const sheet of allSheets) {
    const index = sheet.bookings.findIndex(
      (curSheet) => curSheet.phone === phone,
    );
    if (index !== -1) {
      mappedTitelWithRows.set(sheet.sheetName, index + BOOKINGS_START_ROW);
    } else {
      mappedTitelWithRows.set(sheet.sheetName, index);
    }
  }
  return mappedTitelWithRows;
}

export function filterByXMarkInPartyName(allSheets: ISheetData[]) {
  return (allSheets = allSheets.filter(
    (sheet) => !sheet.partyName.includes('❌'),
  ));
}

export function getMapedRowsBySheetId(
  sheetIdList: number[],
  allSheets: ISheetData[],
  phone: string,
) {
  const mappedTitelWithRows = new Map<string, number>();
  for (const sheetId of sheetIdList) {
    const sheet = allSheets.find((sheet) => sheet.sheetId === sheetId);
    const index =
      sheet?.bookings.findIndex((findedSheet) => findedSheet.phone === phone) ??
      -1;
    if (index !== -1) {
      mappedTitelWithRows.set(sheet!.sheetName, index + BOOKINGS_START_ROW);
    } else {
      mappedTitelWithRows.set(sheet!.sheetName, index);
    }
  }
  return mappedTitelWithRows;
}

export function getRandomMessage(messageAray: string[]) {
  return messageAray[Math.floor(Math.random() * messageAray.length)];
}

export function validatePhoneNumber(phone: string) {
  return /^(375\d{9}|79\d{9}|370\d{8}|371\d{8}|48\d{9})$/.test(phone);
}

export function validateGuestName(name: string) {
  if (name.toLowerCase().includes('отмен')) {
    return 'idiot';
  }
  return /^[A-Za-zА-Яа-яЁё\s'-]+$/.test(name);
}

export function validatePositiveNumber(number: number) {
  if (isNaN(number) || number <= 0) {
    return false;
  } else return true;
}

export async function addNewBooking(
  spreadsheetId: string,
  ctx: MyContext,
  state: UserSession,
) {
  const titlesForBooking: [number, string][] =
    state.selectedOptions?.map((sheetId) => [
      sheetId,
      state.allTablesData?.find((sheet) => sheet.sheetId === sheetId)
        ?.sheetName ?? '',
    ]) ?? [];
  const bookingData = [
    new Date().toISOString(),
    '',
    state.name || '',
    state.phone || '',
    state.places || '',
    ctx.from?.username || 'no_nickname',
    state.hookah === true ? 1 : '',
    state.isTableForTwo === true ? 1 : '',
  ];

  console.log(
    `new booking: ${bookingData.join(' | ')} in ${titlesForBooking.join(' | ')}`,
  );
  await appendRowToSheets(spreadsheetId, titlesForBooking, bookingData);
}

export async function updateBookingRows(
  spreadsheetId: string,
  ctx: MyContext,
  state: UserSession,
) {
    if (!state.phone) {
    throw new Error('Не указан телефон для изменения бронирования');
  }

  const selectedSheets = state.allTablesData!.filter(
    (sheet) => state.selectedOptions?.includes(sheet.sheetId),
  );

  const mappedRows = await getBookingRowsByPhone(
    spreadsheetId,
    selectedSheets,
    state.phone,
  );
  const data = [
    state.name || '',
    state.phone || '',
    state.places || '',
    ctx.from?.username || 'no_nickname',
    state.hookah === true ? 1 : '',
    state.isTableForTwo === true ? 1 : '',
  ];

  const createLogRecord = () => {
    let record = '';
    for (const [key, value] of mappedRows) {
      record = record + `${key} row ${value} | `;
    }
    return record;
  };

  console.log(
    `new update booking: ${[state.name, state.phone, ...data].join(' | ')} in ${createLogRecord()}`,
  );

  const sheetsWithBooking = selectedSheets.filter(
    (sheet) =>
      (mappedRows.get(sheet.sheetName) ?? -1) >= BOOKINGS_START_ROW,
  );

  const sheetsWithoutBooking = selectedSheets.filter(
    (sheet) =>
      (mappedRows.get(sheet.sheetName) ?? -1) < BOOKINGS_START_ROW,
  );

  if (sheetsWithBooking.length > 0) {
    await batchUpdateRowsByMap(spreadsheetId, mappedRows, data);
  }

  return {
    updatedSheets: sheetsWithBooking,
    notFoundSheets: sheetsWithoutBooking,
  };
}

export async function deleteBookingRow(
  spreadsheetId: string,
  ctx: MyContext,
  state: UserSession,
) {
  const selectedSheets = state.allTablesData!.filter(
    (sheet) => state.selectedOptions?.includes(sheet.sheetId)
  )

  if (!state.phone) {
    throw new Error('Не указан телефон для отмены бронирования');
  }

  const mappedRowsByPhone = await getBookingRowsByPhone(
    spreadsheetId,
    selectedSheets,
    state.phone
  )

  const createLogRecord = () => {
    let record = '';
    for (const [key, value] of mappedRowsByPhone) {
      record = record + `${key} row ${value} | `;
    }
    return record;
  };

  console.log(
    `delete booking: ${[state.name, state.phone].join(' | ')} in ${createLogRecord()} `,
  );

  const sheetListWithDeletingPhone = selectedSheets.filter(
    (sheet) => (mappedRowsByPhone.get(sheet.sheetName) ?? -1) >= BOOKINGS_START_ROW
  );
  const sheetListWithoutDeletingPhone = selectedSheets.filter(
    (sheet) => (mappedRowsByPhone.get(sheet.sheetName) ?? -1) < BOOKINGS_START_ROW
  );
  if (sheetListWithDeletingPhone.length > 0) {
    await batchDeleteRowsByMap(
      spreadsheetId,
      sheetListWithDeletingPhone,
      mappedRowsByPhone
    )
  }
  
  return { sheetListWithDeletingPhone, sheetListWithoutDeletingPhone };
}
