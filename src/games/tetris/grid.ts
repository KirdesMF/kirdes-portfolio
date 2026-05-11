export type CellValue = null | string;

export type Grid = Array<Array<CellValue>>;

const COLS = 10;
const ROWS = 20;

export function createEmptyGrid(): Grid {
	return Array.from({ length: ROWS }, () => Array<CellValue>(COLS).fill(null));
}
