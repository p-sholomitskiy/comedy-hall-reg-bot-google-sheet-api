import { google } from 'googleapis';
import { auth } from './auth.js';
export const sheetsClient = google.sheets({ version: 'v4', auth });
