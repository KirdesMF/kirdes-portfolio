import type { Graphics } from "pixi.js";

export type BoardCell = null | number;

export type Board = Array<Array<BoardCell>>;

const COLS = 10;
const ROWS = 20;

export function createEmptyBoard(): Board {
	return Array.from({ length: ROWS }, () => Array<BoardCell>(COLS).fill(null));
}

interface DrawBoardOptions {
	strokeColor?: number;
	strokeAlpha?: number;
}

/** Redraw the board layer — clears previous drawing and fills in all occupied cells. */
export function drawBoard(
	g: Graphics,
	board: Board,
	cellSize: number,
	options?: DrawBoardOptions,
): void {
	g.clear();

	const strokeColor = options?.strokeColor ?? 0xffffff;
	const strokeAlpha = options?.strokeAlpha ?? 0.3;

	for (let y = 0; y < board.length; y++) {
		for (let x = 0; x < board[y].length; x++) {
			const color = board[y][x];
			if (color === null) continue;

			g.rect(x * cellSize, y * cellSize, cellSize, cellSize);
			g.fill(color);
			g.stroke({ width: 1, color: strokeColor, alpha: strokeAlpha });
		}
	}
}
