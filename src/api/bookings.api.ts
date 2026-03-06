import { MyContext, UserSession } from '../bot/bot.types.js';
import { BOOKINGS_START_ROW } from '../sheets/sheets.constants.js';
import {
  appendRowToSheets,
  batchDeleteRowsByMap,
  batchUpdateRowsByMap,
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
      sheet?.bookings.findIndex((findedSheet) => findedSheet.phone === phone) ||
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
  return /^[A-Za-zА-Яа-яЁё\s'-]+$/.test(name);
}

export function validatePositiveNumber(number: number) {
  if (isNaN(number) || number <= 0) return false;
  else return true;
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
    state.name || '',
    state.phone || '',
    state.places || '',
    ctx.from?.username || 'no_nickname',
    state.hookah === true ? 1 : '',
    state.isTableForTwo === true ? 1 : '',
  ];

  console.log(titlesForBooking);
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
  const mappedRows = getMapedRowsBySheetId(
    state.selectedOptions!,
    state.allTablesData!,
    state.phone!,
  );
  const data = [
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
    `new updatet booking: ${[state.name, state.phone, ...data].join(' | ')} in ${createLogRecord()}`,
  );

  await batchUpdateRowsByMap(spreadsheetId, mappedRows, data);
}

export async function deleteBookingRow(
  spreadsheetId: string,
  ctx: MyContext,
  state: UserSession,
) {
  const mappedRows = getMapedRowsBySheetId(
    state.selectedOptions!,
    state.allTablesData!,
    state.phone!,
  );

  const createLogRecord = () => {
    let record = '';
    for (const [key, value] of mappedRows) {
      record = record + `${key} row ${value} | `;
    }
    return record;
  };

  console.log(
    `delete booking: ${[state.name, state.phone].join(' | ')} in ${createLogRecord()} `,
  );
  batchDeleteRowsByMap(spreadsheetId, state.allTablesData!, mappedRows);
}
