import { sheets_v4 } from 'googleapis';
import { sheetsClient } from '../google/sheets.client.js';
import {
  DATA_RANGE_COUNT,
  DataCells,
  IBookingRow,
  ISheetData,
  SheetInfo,
} from './sheets.types.js';
import {
  PHONE_COLUMN_INDEX,
  BOOKINGS_START_ROW,
  START_APPEND_COL,
  START_UPDATE_COL,
  END_COL,
} from './sheets.constants.js';

export async function getSheetsProperties(spreadsheetId: string) {
  const response = await sheetsClient.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties(sheetId,title)',
  });
  return (
    response.data.sheets
      ?.map((sheet) => sheet.properties)
      .filter(
        (props): props is sheets_v4.Schema$SheetProperties =>
          props !== undefined,
      ) ?? []
  );
}

function escapeSheetTitle(title: string): string {
  const safe = title.replace(/'/g, "''");
  return `'${safe}'`;
}

export async function getAllSheetsData(
  spreadsheetId: string,
  sheets: sheets_v4.Schema$SheetProperties[],
): Promise<ISheetData[]> {
  const ranges: string[] = [];

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
  
  const result: ISheetData[] = [];

  for (let i = 0; i < sheets.length; i++) {
    const base = i * DATA_RANGE_COUNT;
    const [
      titleCell,
      seatsCell,
      suggestHookahCell,
      hookahCell,
      suggestTableCell,
      tableCell,
      tableCostCell,
      rowsRange,
    ] = valueRanges.slice(base, base + DATA_RANGE_COUNT);

    const { sheetId, title } = sheets[i];

    const partyName = titleCell?.values?.[0]?.[0] ?? '';
    const seats = Number(seatsCell?.values?.[0]?.[0] ?? 0);
    const suggestHookah = suggestHookahCell?.values?.[0]?.[0] === 'TRUE';
    const hookah = Number(hookahCell?.values?.[0]?.[0] ?? 0);
    const suggestTable = suggestTableCell?.values?.[0]?.[0] === 'TRUE';
    const tableCost = Number(tableCostCell?.values?.[0]?.[0] ?? 0);
    const tables = Number(tableCell?.values?.[0]?.[0] ?? 0);
    const rows = rowsRange?.values ?? [];
    const mappedRows: IBookingRow[] = rows.map((record) => {
      return {
        date: record[0],
        check: record[1],
        name: record[2],
        phone: record[3],
        seats: record[4],
        nickname: record[5],
        isHookahNeeded: record[6] ? true : false,
        isForTwo: record[7] ? true : false,
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

export async function batchUpdateRowsByMap(
  spreadsheetId: string,
  titlesToRowNumber: Map<string, number>,
  newValues: (string | number | null)[],
) {
  console.log('newValues', newValues)
  const data: sheets_v4.Schema$ValueRange[] = [];

  for (const [sheetTitle, rowNumberInSheet] of titlesToRowNumber.entries()) {
    if (rowNumberInSheet < 0) continue; // пропускаем -1

    const rowNumber = rowNumberInSheet;
    const range = `${escapeSheetTitle(sheetTitle)}!${START_UPDATE_COL}${rowNumber}:${END_COL}${rowNumber}`;

    data.push({
      range,
      values: [newValues],
    });
  }

  if (!data.length) return;

  await sheetsClient.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data,
    },
  });
}

export async function appendRowToSheets(
  spreadsheetId: string,
  sheetTitles: [number, string][],
  rowValues: (string | number | boolean | null)[],
) {
  await Promise.all(
    sheetTitles.map(async ([sheetId, title]) => {
      // Read only booking data starting from row 2.
      // Columns I:W are not considered when searching for the last booking row.
      const valuesResponse = await sheetsClient.spreadsheets.values.get({
        spreadsheetId,
        range: `${escapeSheetTitle(title)}!${START_APPEND_COL}${BOOKINGS_START_ROW}:${END_COL}`,
      });

      const values = valuesResponse.data.values ?? [];

      // Find the last row where at least one cell in A:H is not empty.
      // This works even when column A is empty but B:H contain data.
      const lastRowIndex = values.reduce(
        (lastIndex, row, index) =>
          row.some((value) => value !== undefined && value !== '')
            ? index
            : lastIndex,
        -1,
      );

      // Calculate the physical row number for the new booking.
      // If there are no bookings yet, start from row 2.
      const rowNumber =
        lastRowIndex === -1
          ? BOOKINGS_START_ROW
          : BOOKINGS_START_ROW + lastRowIndex + 1;

      // Write the booking only to A:H.
      // Columns I:W are intentionally not touched.
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId,
        range: `${escapeSheetTitle(title)}!A${rowNumber}:H${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowValues],
        },
      });

      // Apply formatting only to the new booking row A:H.
      await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            // Add borders to all cells A:H.
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: rowNumber - 1,
                  endRowIndex: rowNumber,
                  startColumnIndex: 0,
                  endColumnIndex: 8,
                },
                cell: {
                  userEnteredFormat: {
                    borders: {
                      top: { style: 'SOLID' },
                      bottom: { style: 'SOLID' },
                      left: { style: 'SOLID' },
                      right: { style: 'SOLID' },
                    },
                  },
                },
                fields: 'userEnteredFormat.borders',
              },
            },

            // A — left-aligned text without wrapping.
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: rowNumber - 1,
                  endRowIndex: rowNumber,
                  startColumnIndex: 0,
                  endColumnIndex: 1,
                },
                cell: {
                  userEnteredFormat: {
                    horizontalAlignment: 'LEFT',
                    wrapStrategy: 'CLIP',
                  },
                },
                fields:
                  'userEnteredFormat.horizontalAlignment,userEnteredFormat.wrapStrategy',
              },
            },

            // B — centered checkbox.
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: rowNumber - 1,
                  endRowIndex: rowNumber,
                  startColumnIndex: 1,
                  endColumnIndex: 2,
                },
                cell: {
                  userEnteredFormat: {
                    horizontalAlignment: 'CENTER',
                  },
                },
                fields: 'userEnteredFormat.horizontalAlignment',
              },
            },
            {
              setDataValidation: {
                range: {
                  sheetId,
                  startRowIndex: rowNumber - 1,
                  endRowIndex: rowNumber,
                  startColumnIndex: 1,
                  endColumnIndex: 2,
                },
                rule: {
                  condition: {
                    type: 'BOOLEAN',
                  },
                  showCustomUi: true,
                  strict: true,
                },
              },
            },

            // C:D — left-aligned text.
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: rowNumber - 1,
                  endRowIndex: rowNumber,
                  startColumnIndex: 2,
                  endColumnIndex: 4,
                },
                cell: {
                  userEnteredFormat: {
                    horizontalAlignment: 'LEFT',
                  },
                },
                fields: 'userEnteredFormat.horizontalAlignment',
              },
            },

            // E — centered text.
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: rowNumber - 1,
                  endRowIndex: rowNumber,
                  startColumnIndex: 4,
                  endColumnIndex: 5,
                },
                cell: {
                  userEnteredFormat: {
                    horizontalAlignment: 'CENTER',
                  },
                },
                fields: 'userEnteredFormat.horizontalAlignment',
              },
            },

            // F — left-aligned text.
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: rowNumber - 1,
                  endRowIndex: rowNumber,
                  startColumnIndex: 5,
                  endColumnIndex: 6,
                },
                cell: {
                  userEnteredFormat: {
                    horizontalAlignment: 'LEFT',
                  },
                },
                fields: 'userEnteredFormat.horizontalAlignment',
              },
            },

            // G:H — centered text.
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: rowNumber - 1,
                  endRowIndex: rowNumber,
                  startColumnIndex: 6,
                  endColumnIndex: 8,
                },
                cell: {
                  userEnteredFormat: {
                    horizontalAlignment: 'CENTER',
                  },
                },
                fields: 'userEnteredFormat.horizontalAlignment',
              },
            },
          ],
        },
      });
    }),
  );
}

interface SheetMeta {
  title: string;
  sheetId: number;
}

/**
 * sheetsMeta: массив метаданных листов (title + sheetId)
 * titlesToRowIndex: Map<sheetTitle, rowIndexInSheet> (0-based, -1 если нет)
 */
export async function batchDeleteRowsByMap(
  spreadsheetId: string,
  sheetsData: ISheetData[],
  titlesToRowIndex: Map<string, number>,
) {
  const requests: sheets_v4.Schema$Request[] = [];

  for (const { sheetName, sheetId } of sheetsData) {
    const rowIndexInSheet = titlesToRowIndex.get(sheetName) || -1;
    if (rowIndexInSheet == null || rowIndexInSheet < 0) continue;

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

  if (!requests.length) return;

  await sheetsClient.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  });
}

async function setCheckbox(
  spreadsheetId: string,
  sheetId: number,
  rowNumber: number,
) {
  await sheetsClient.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          setDataValidation: {
            range: {
              sheetId,
              startRowIndex: rowNumber - 1,
              endRowIndex: rowNumber,
              startColumnIndex: 1,
              endColumnIndex: 2,
            },
            rule: {
              condition: {
                type: 'BOOLEAN',
              },
              showCustomUi: true,
            },
          },
        },
      ],
    },
  });
}
