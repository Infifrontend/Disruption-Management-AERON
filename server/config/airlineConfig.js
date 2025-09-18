import { readFile } from 'fs/promises';
const raw = await readFile(new URL('../../src/config/airlineThemes.json', import.meta.url));
const airlineThemes = JSON.parse(raw);
const airlineCode = process.env.VITE_AIRLINE_CODE || 'FZ';
const airlineConfig = airlineThemes[airlineCode] || airlineThemes.FZ || {};
export default airlineConfig;
