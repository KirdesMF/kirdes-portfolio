import { Application, Container, Graphics } from "pixi.js";
import { useEffect, useRef } from "react";

import { type Board, createEmptyBoard, drawBoard } from "./board";
import { PIECE_DEFINITIONS, type PieceType, randomPieceType } from "./pieces";

const CELL_SIZE = 28;
const GRID_COLS = 10;
const GRID_ROWS = 20;
const DROP_INTERVAL_MS = 1000;
const LOCK_DELAY_MS = 500;

const GRID_WIDTH = GRID_COLS * CELL_SIZE;
const GRID_HEIGHT = GRID_ROWS * CELL_SIZE;

const GRID_BG_COLOR = 0x16213e;
const GRID_BORDER_COLOR = 0x334155;
const GRID_LINE_COLOR = 0x334155;

type ActivePiece = {
	type: PieceType;
	row: number;
	col: number;
};

// Check if the piece can move by (dRow, dCol) without leaving the grid or overlapping placed blocks.
function canMove(piece: ActivePiece, dRow: number, dCol: number, board: Board): boolean {
	const def = PIECE_DEFINITIONS[piece.type];

	for (const [dr, dc] of def.shape) {
		const r = piece.row + dr + dRow;
		const c = piece.col + dc + dCol;
		if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) return false;
		if (board[r][c] !== null) return false;
	}

	return true;
}

// Write the piece's cells onto the board.
function placePiece(piece: ActivePiece, board: Board): void {
	const def = PIECE_DEFINITIONS[piece.type];

	for (const [dr, dc] of def.shape) {
		const r = piece.row + dr;
		const c = piece.col + dc;
		board[r][c] = def.color;
	}
}

function spawnPiece(type: PieceType): ActivePiece {
	const shape = PIECE_DEFINITIONS[type].shape;
	const maxCol = Math.max(...shape.map(([, c]) => c));
	const col = Math.floor((GRID_COLS - (maxCol + 1)) / 2);
	const minRow = Math.min(...shape.map(([r]) => r));

	return { type, row: -minRow, col };
}

function drawPiece(g: Graphics, piece: ActivePiece, cellSize: number): void {
	g.clear();
	const def = PIECE_DEFINITIONS[piece.type];

	for (const [dr, dc] of def.shape) {
		const x = (piece.col + dc) * cellSize;
		const y = (piece.row + dr) * cellSize;
		g.rect(x, y, cellSize, cellSize);
		g.fill(def.color);
	}
}

function createGridBackground(): Graphics {
	const g = new Graphics();

	g.rect(0, 0, GRID_WIDTH, GRID_HEIGHT);
	g.fill({ color: GRID_BG_COLOR, alpha: 0.5 });
	g.stroke({ width: 1, color: GRID_BORDER_COLOR });

	return g;
}

function createGridLines(): Graphics {
	const g = new Graphics();

	for (let x = CELL_SIZE; x < GRID_WIDTH; x += CELL_SIZE) {
		g.moveTo(x, 0);
		g.lineTo(x, GRID_HEIGHT);
	}

	for (let y = CELL_SIZE; y < GRID_HEIGHT; y += CELL_SIZE) {
		g.moveTo(0, y);
		g.lineTo(GRID_WIDTH, y);
	}

	g.stroke({ width: 0.5, color: GRID_LINE_COLOR, alpha: 0.4 });

	return g;
}

function createScene() {
	const gridArea = new Container();

	const boardLayer = new Container();
	const boardGraphics = new Graphics();
	boardLayer.addChild(boardGraphics);

	const activePieceLayer = new Container();
	const pieceGraphics = new Graphics();
	activePieceLayer.addChild(pieceGraphics);

	gridArea.addChild(createGridBackground());
	gridArea.addChild(createGridLines());
	gridArea.addChild(boardLayer);
	gridArea.addChild(activePieceLayer);

	return { gridArea, pieceGraphics, boardGraphics };
}

export function TetrisGame() {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		let app: Application | null = null;
		let cancelled = false;
		let removeKeyboard: (() => void) | null = null;

		async function setupPixi() {
			const canvas = canvasRef.current;
			const host = containerRef.current;
			if (!canvas || !host) return;

			const pixApp = new Application();
			await pixApp.init({
				resizeTo: host,
				backgroundAlpha: 0,
				antialias: true,
				autoDensity: true,
				resolution: window.devicePixelRatio,
				canvas,
			});

			if (cancelled) return;

			const { gridArea, pieceGraphics, boardGraphics } = createScene();
			pixApp.stage.addChild(gridArea);

			// Game state (mutable, driven by ticker and input)
			let dropAccumulator = 0;
			let lockAccumulator = 0;
			let isLocking = false;
			const board: Board = createEmptyBoard();
			const piece: ActivePiece = spawnPiece(randomPieceType());

			drawPiece(pieceGraphics, piece, CELL_SIZE);

			pixApp.ticker.add((ticker) => {
				dropAccumulator += ticker.deltaMS;

				if (dropAccumulator >= DROP_INTERVAL_MS) {
					dropAccumulator -= DROP_INTERVAL_MS;

					if (canMove(piece, 1, 0, board)) {
						piece.row++;
						drawPiece(pieceGraphics, piece, CELL_SIZE);
						isLocking = false;
						lockAccumulator = 0;
					} else {
						isLocking = true;
					}
				}

				if (isLocking) {
					lockAccumulator += ticker.deltaMS;

					if (lockAccumulator >= LOCK_DELAY_MS) {
						placePiece(piece, board);
						drawBoard(boardGraphics, board, CELL_SIZE);
						pieceGraphics.clear();

						// Spawn next piece
						const next = spawnPiece(randomPieceType());
						piece.type = next.type;
						piece.row = next.row;
						piece.col = next.col;
						drawPiece(pieceGraphics, piece, CELL_SIZE);

						dropAccumulator = 0;
						isLocking = false;
						lockAccumulator = 0;
					}
				}
			});

			function onKeyDown(e: KeyboardEvent) {
				switch (e.key) {
					case "ArrowLeft":
						e.preventDefault();
						if (canMove(piece, 0, -1, board)) {
							piece.col--;
							drawPiece(pieceGraphics, piece, CELL_SIZE);
							isLocking = false;
							lockAccumulator = 0;
						}
						break;

					case "ArrowRight":
						e.preventDefault();
						if (canMove(piece, 0, 1, board)) {
							piece.col++;
							drawPiece(pieceGraphics, piece, CELL_SIZE);
							isLocking = false;
							lockAccumulator = 0;
						}
						break;

					case "ArrowDown":
						e.preventDefault();
						if (canMove(piece, 1, 0, board)) {
							piece.row++;
							dropAccumulator = 0;
							drawPiece(pieceGraphics, piece, CELL_SIZE);
							isLocking = false;
							lockAccumulator = 0;
						}
						break;
				}
			}

			window.addEventListener("keydown", onKeyDown);
			removeKeyboard = () => window.removeEventListener("keydown", onKeyDown);

			app = pixApp;
		}

		setupPixi();

		return () => {
			cancelled = true;
			removeKeyboard?.();
			if (app) {
				app.destroy(
					{ removeView: true, releaseGlobalResources: true },
					{ children: true, texture: true, textureSource: true },
				);
			}
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className="bg-background"
			style={{ width: GRID_WIDTH, height: GRID_HEIGHT }}
		>
			<canvas ref={canvasRef} />
		</div>
	);
}
