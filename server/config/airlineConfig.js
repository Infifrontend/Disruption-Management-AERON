import { readFile } from 'fs/promises';
// console.log("airline config ====>", airlineConfig)

const raw = await readFile(new URL('../src/config/airlineThemes.json', import.meta.url));
const airlineTheme = JSON.parse(raw);
export default airlineTheme
