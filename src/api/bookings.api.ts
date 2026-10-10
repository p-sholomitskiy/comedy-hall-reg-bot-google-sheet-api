import { randomUUID } from 'node:crypto';
import { MyContext, UserSession } from '../bot/bot.types.js';
import { BOOKINGS_START_ROW } from '../sheets/sheets.constants.js';
import {
  appendRowToSheets,
  batchDeleteRowsByMap,
  batchUpdateRowsByMap,
  getBookingRowsByPhone,
} from '../sheets/sheets.repo.js';
import { ISheetData } from '../sheets/sheets.types.js';
import { createLogEventRecord } from '../utils/logger.util.js';

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
  const bookingData = {
    timestamp: new Date().toISOString(),
    name: state.name || '',
    phone: state.phone || '',
    places: state.places || '',
    nickname: ctx.from?.username || 'no_nickname',
    hookah: state.hookah === true,
    tableForTwo: state.isTableForTwo === true,
  };

  const rowValues = [
    bookingData.timestamp,
    '',
    bookingData.name,
    bookingData.phone,
    bookingData.places,
    bookingData.nickname,
    bookingData.hookah ? 1 : '',
    bookingData.tableForTwo ? 1 : '',
  ];

  const logFields = {
    operationId: randomUUID(),
    name: bookingData.name,
    phone: bookingData.phone,
    places: bookingData.places,
    nickname: bookingData.nickname,
    hookah: bookingData.hookah,
    tableForTwo: bookingData.tableForTwo,
    selectedCount: titlesForBooking.length,
    selectedSheetNames: titlesForBooking
      .map(([, title]) => title)
      .join(', '),
  };

  createLogEventRecord({
    event: 'booking.add.requested',
    fields: logFields,
    level: 'info',
  });

  try {
    await appendRowToSheets(
      spreadsheetId,
      titlesForBooking,
      rowValues,
    );

    createLogEventRecord({
      event: 'booking.add.success',
      fields: logFields,
      level: 'info',
    });
  } catch (error) {
    createLogEventRecord({
      event: 'booking.add.failed',
      fields: {
        ...logFields,
        errorType: error instanceof Error ? error.name : 'UnknownError',
      },
      level: 'error',
    });

    throw error;
  }
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

  const bookingData = {
    name: state.name || '',
    phone: state.phone,
    places: state.places || '',
    nickname: ctx.from?.username || 'no_nickname',
    hookah: state.hookah === true,
    tableForTwo: state.isTableForTwo === true,
  };
  const rowValues = [
    bookingData.name,
    bookingData.phone,
    bookingData.places,
    bookingData.nickname,
    bookingData.hookah ? 1 : '',
    bookingData.tableForTwo ? 1 : '',
  ];
  const logFields = {
    operationId: randomUUID(),
    ...bookingData,
    selectedCount: selectedSheets.length,
    selectedSheetNames: selectedSheets
      .map((sheet) => sheet.sheetName)
      .join(', '),
  };

  createLogEventRecord({
    event: 'booking.update.requested',
    fields: logFields,
    level: 'info',
  });

  try {
    const mappedRows = await getBookingRowsByPhone(
      spreadsheetId,
      selectedSheets,
      bookingData.phone,
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
      await batchUpdateRowsByMap(spreadsheetId, mappedRows, rowValues);

      createLogEventRecord({
        event: 'booking.update.success',
        fields: {
          ...logFields,
          updatedCount: sheetsWithBooking.length,
          searchedRows: Array.from(mappedRows)
            .map(([title, row]) => `${title} row ${row}`)
            .join(' | '),
        },
        level: 'info',
      });
    }

    if (sheetsWithoutBooking.length > 0) {
      createLogEventRecord({
        event: 'booking.update.not_found',
        fields: {
          ...logFields,
          notFoundCount: sheetsWithoutBooking.length,
          notFoundSheetNames: sheetsWithoutBooking
            .map((sheet) => sheet.sheetName)
            .join(', '),
        },
        level: 'info',
      });
    }

    return {
      updatedSheets: sheetsWithBooking,
      notFoundSheets: sheetsWithoutBooking,
    };
  } catch (error) {
    createLogEventRecord({
      event: 'booking.update.failed',
      fields: {
        ...logFields,
        errorType: error instanceof Error ? error.name : 'UnknownError',
      },
      level: 'error',
    });

    throw error;
  }
}

export async function deleteBookingRow(
  spreadsheetId: string,
  ctx: MyContext,
  state: UserSession,
) {
  const operationId = randomUUID();

  const selectedSheets = state.allTablesData!.filter(
    (sheet) => state.selectedOptions?.includes(sheet.sheetId)
  )

  if (!state.phone) {
    throw new Error('Не указан телефон для отмены бронирования');
  }

  const logFields = {
    operationId,
    phone: state.phone,
    selectedCount: selectedSheets.length,
    selectedSheetNames: selectedSheets
      .map((sheet) => sheet.sheetName)
      .join(', '),
  };

  createLogEventRecord({
    event: 'booking.cancel.requested',
    fields: logFields,
    level: 'info'
  })

  try {

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

      createLogEventRecord({
        event: 'booking.cancel.success',
        fields: {
          ...logFields,
          deletedCount: sheetListWithDeletingPhone.length,
          searchedRows: createLogRecord(),
        },
        level: 'info',
      });
    }

    if (sheetListWithoutDeletingPhone.length > 0) {
      createLogEventRecord({
        event: 'booking.cancel.not_found',
        fields: {
          ...logFields,
          notFoundCount: sheetListWithoutDeletingPhone.length,
          notFoundSheetNames: sheetListWithoutDeletingPhone
            .map((sheet) => sheet.sheetName)
            .join(', '),
        },
        level: 'info',
      });
    }

    return { sheetListWithDeletingPhone, sheetListWithoutDeletingPhone };

  } catch (error) {
    createLogEventRecord({
      event: 'booking.cancel.failed',
      fields: {
        ...logFields,
        errorType: error instanceof Error ? error.name : 'UnknownError',
      },
      level: 'error',
    });

    throw error;
  }
}
