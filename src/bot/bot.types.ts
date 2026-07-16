import 'dotenv/config';
import { Context } from 'telegraf';
import { ISheetData } from '../sheets/sheets.types.js';
export interface SheetOption {
  index: number;
  title: string;
  availableSeats: number;
  currentSeats: number;
  hookah: number;
  tables: number;
  suggestTable: boolean;
  suggestHookah: boolean;
  tableCost: number;
}

export interface UserSession {
  step?:
    | 'input_phone'
    | 'select_party'
    | 'input_name'
    | 'input_places'
    | 'input_hookah'
    | 'input_table';
  phone?: string;
  selectedOptions?: number[];
  action?: 'reserve' | 'edit' | 'delete' | 'check';
  optionsForSelect?: Map<number, SheetOption>;
  name?: string;
  places?: number;
  postRequestsErrors?: Array<String>;
  hookah?: boolean;
  isTableForTwo?: boolean;
  allTablesData?: ISheetData[];
  tableCost?: number;
  tables?: number;
  suggestTable?: boolean;
  suggestHookah?: boolean;
}

// Расширяем Context
export type MyContext = Context & { session: UserSession };
