import type { Graphics } from "pixi.js";

export type BoardCell = null | number;

export type Board = Array<Array<BoardCell>>;

const COLS = 10;
const ROWS = 20;

export function createEmptyBoard(): Board {
	return Array.from({ length: ROWS }, () => Array<BoardCell>(COLS).fill(null));
}

/** Redraw the board layer — clears previous drawing and fills in all occupied cells. */
export function drawBoard(g: Graphics, board: Board, cellSize: number): void {
	g.clear();

	for (let y = 0; y < board.length; y++) {
		for (let x = 0; x < board[y].length; x++) {
			const color = board[y][x];
			if (color === null) continue;

			g.rect(x * cellSize, y * cellSize, cellSize, cellSize);
			g.fill(color);
			g.stroke({ width: 1, color: 0xffffff, alpha: 0.1 });
		}
	}
}
