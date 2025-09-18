import { readFile } from 'fs/promises';

const raw = await readFile(new URL('../../src/config/airlineThemes.json', import.meta.url));
const airlineConfig = JSON.parse(raw);
export default airlineTheme
