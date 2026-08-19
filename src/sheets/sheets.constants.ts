export const PARTY_META_RANGES = {
  TITLE: {
    startRowIndex: 0,
    endRowIndex: 1,
    startColumnIndex: 7,
    endColumnIndex: 8,
  },
  SEATS: {
    startRowIndex: 0,
    endRowIndex: 1,
    startColumnIndex: 11,
    endColumnIndex: 12,
  },
  HOOKAH: {
    startRowIndex: 0,
    endRowIndex: 1,
    startColumnIndex: 13,
    endColumnIndex: 14,
  },
  BOOKINGS: {
    startRowIndex: 1,
    startColumnIndex: 0,
    endColumnIndex: 7,
  },
} as const;

export const START_APPEND_COL = 'A' as const;

export const START_UPDATE_COL = 'C' as const;

export const END_COL = 'H' as const;

export const BOOKINGS_START_ROW = 2 as const; // BOOKINGS = "A2:G"

export const PHONE_COLUMN_INDEX = 3 as const; // column "D"
