import { GoogleAuth } from 'google-auth-library';
import 'dotenv/config';
const credentials = JSON.parse(process.env.GOOGLE_SPREAD_SHEET_ACCESS_JSON);
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
export const auth = new GoogleAuth({
    credentials,
    scopes: SCOPES,
});
