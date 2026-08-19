export interface IBookingRow {
  date: string;
  name: string;
  phone: string;
  seats: number;
  nickname?: string;
  isHookahNeeded: boolean;
  isForTwo?: boolean;
}

export type SheetInfo = { sheetId: number; sheetName: string };

export interface ISheetData {
  sheetId: number;
  spreadsheetId: string;
  sheetName: string;
  partyName: string;
  availableSeats: number;
  availableHookah: number;
  suggestHookah: boolean;
  suggestTable: boolean;
  tableCost: number;
  availableTables: number;
  bookings: IBookingRow[];
}

export interface IGridRange {
  sheetId: number;
  startRowIndex: number;
  endRowIndex: number;
  startColumnIndex?: number;
  endColumnIndex?: number;
}

export enum DataCells {
  PARTY_NAME = 'J1',
  AVAILABLE_SEATS = 'S1',
  AVAILABLE_HOOKAH = 'W1',
  AVAILABLE_TABLES = 'O1',
  TABLE_COST = 'O1',
  SUGGEST_TABLE = 'M1',
  SUGGEST_HOOKAH = 'U1',
  BOOKINGS = 'A2:H',
}

export const DATA_RANGE_COUNT = Object.keys(DataCells).length;