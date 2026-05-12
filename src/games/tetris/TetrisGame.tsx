import { Application, Container, Graphics, Text } from "pixi.js";
import { useEffect, useRef } from "react";

import { type Board, type BoardCell, createEmptyBoard, drawBoard } from "./board";
import { PIECE_DEFINITIONS, type PieceType, randomPieceType, type Shape } from "./pieces";

const CELL_SIZE = 28;
const GRID_COLS = 10;
const GRID_ROWS = 20;
const DROP_INTERVAL_MS = 1000;
const LOCK_DELAY_MS = 300;

const GRID_WIDTH = GRID_COLS * CELL_SIZE;
const GRID_HEIGHT = GRID_ROWS * CELL_SIZE;

const GRID_BG_COLOR = 0x16213e;
const GRID_BORDER_COLOR = 0x334155;
const GRID_LINE_COLOR = 0x334155;

type ActivePiece = {
	type: PieceType;
	row: number;
	col: number;
	rotation: number;
};

// Check if the piece at a given rotation and offset would be valid.
function canPlace(
	piece: ActivePiece,
	rotation: number,
	dRow: number,
	dCol: number,
	board: Board,
): boolean {
	const shape: Shape = PIECE_DEFINITIONS[piece.type].shapes[rotation];

	for (const [dr, dc] of shape) {
		const r = piece.row + dr + dRow;
		const c = piece.col + dc + dCol;
		if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) return false;
		if (board[r][c] !== null) return false;
	}

	return true;
}

// Check if the piece can move by (dRow, dCol) in its current rotation.
function canMove(piece: ActivePiece, dRow: number, dCol: number, board: Board): boolean {
	return canPlace(piece, piece.rotation, dRow, dCol, board);
}

// Check if the piece can rotate to the given rotation (with wall kicks).
function canRotate(piece: ActivePiece, newRotation: number, board: Board): number | null {
	// Try the rotation at current position first.
	if (canPlace(piece, newRotation, 0, 0, board)) return 0;

	// Wall kick: try shifting left or right by 1.
	if (canPlace(piece, newRotation, 0, -1, board)) return -1;
	if (canPlace(piece, newRotation, 0, 1, board)) return 1;

	return null;
}

// Remove full rows and shift everything above down. Returns number of lines cleared.
function clearLines(board: Board): number {
	let cleared = 0;

	for (let r = GRID_ROWS - 1; r >= 0; r--) {
		const isFull = board[r].every((cell) => cell !== null);

		if (isFull) {
			board.splice(r, 1);
			board.unshift(Array<BoardCell>(GRID_COLS).fill(null));
			cleared++;
			r++; // Re-check this row index after shift
		}
	}

	return cleared;
}

// Check if the newly spawned piece overlaps with placed blocks.
function checkGameOver(piece: ActivePiece, board: Board): boolean {
	const shape: Shape = PIECE_DEFINITIONS[piece.type].shapes[piece.rotation];

	for (const [dr, dc] of shape) {
		const r = piece.row + dr;
		const c = piece.col + dc;
		if (board[r]?.[c] !== null) return true;
	}

	return false;
}

// Write the piece's cells onto the board.
function placePiece(piece: ActivePiece, board: Board): void {
	const shape: Shape = PIECE_DEFINITIONS[piece.type].shapes[piece.rotation];
	const color = PIECE_DEFINITIONS[piece.type].color;

	for (const [dr, dc] of shape) {
		const r = piece.row + dr;
		const c = piece.col + dc;
		board[r][c] = color;
	}
}

function spawnPiece(type: PieceType): ActivePiece {
	const shape: Shape = PIECE_DEFINITIONS[type].shapes[0];
	const maxCol = Math.max(...shape.map(([, c]) => c));
	const col = Math.floor((GRID_COLS - (maxCol + 1)) / 2);
	const minRow = Math.min(...shape.map(([r]) => r));

	return { type, row: -minRow, col, rotation: 0 };
}

function drawPiece(g: Graphics, piece: ActivePiece, cellSize: number): void {
	g.clear();
	const def = PIECE_DEFINITIONS[piece.type];
	const shape: Shape = def.shapes[piece.rotation];

	for (const [dr, dc] of shape) {
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

function createScoreText(): Text {
	const text = new Text({
		text: "SCORE: 0",
		style: {
			fontFamily: "monospace",
			fontSize: 12,
			fill: 0x94a3b8,
		},
		anchor: { x: 1, y: 0 },
		x: GRID_WIDTH - 8,
		y: 8,
	});

	return text;
}

function createGameOverText(): Text {
	const text = new Text({
		text: "GAME OVER",
		style: {
			fontFamily: "monospace",
			fontSize: 24,
			fill: 0xe74c3c,
			fontWeight: "bold",
		},
		anchor: { x: 0.5, y: 0.5 },
		x: GRID_WIDTH / 2,
		y: GRID_HEIGHT / 2,
	});

	return text;
}

const LINE_SCORES: Record<number, number> = {
	1: 100,
	2: 300,
	3: 500,
	4: 800,
};

function getLineScore(count: number): number {
	return LINE_SCORES[count] ?? 0;
}

function createScene() {
	const gridArea = new Container();

	const boardLayer = new Container();
	const boardGraphics = new Graphics();
	boardLayer.addChild(boardGraphics);

	const activePieceLayer = new Container();
	const pieceGraphics = new Graphics();
	activePieceLayer.addChild(pieceGraphics);

	const scoreText = createScoreText();
	const gameOverText = createGameOverText();
	gameOverText.visible = false;

	gridArea.addChild(createGridBackground());
	gridArea.addChild(createGridLines());
	gridArea.addChild(boardLayer);
	gridArea.addChild(activePieceLayer);
	gridArea.addChild(scoreText);
	gridArea.addChild(gameOverText);

	return { gridArea, pieceGraphics, boardGraphics, scoreText, gameOverText };
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

			const { gridArea, pieceGraphics, boardGraphics, scoreText, gameOverText } = createScene();
			pixApp.stage.addChild(gridArea);

			// Game state (mutable, driven by ticker and input)
			let score = 0;
			let dropAccumulator = 0;
			let lockAccumulator = 0;
			let isLocking = false;
			let gameOver = false;
			const board: Board = createEmptyBoard();
			const piece: ActivePiece = spawnPiece(randomPieceType());

			drawPiece(pieceGraphics, piece, CELL_SIZE);

			pixApp.ticker.add((ticker) => {
				if (gameOver) return;

				const canFall = canMove(piece, 1, 0, board);

				if (canFall) {
					isLocking = false;
					lockAccumulator = 0;

					dropAccumulator += ticker.deltaMS;

					if (dropAccumulator >= DROP_INTERVAL_MS) {
						dropAccumulator -= DROP_INTERVAL_MS;
						piece.row++;
						drawPiece(pieceGraphics, piece, CELL_SIZE);
					}
				} else {
					if (!isLocking) {
						isLocking = true;
						lockAccumulator = 0;
					}

					lockAccumulator += ticker.deltaMS;

					if (lockAccumulator >= LOCK_DELAY_MS) {
						placePiece(piece, board);
						const lines = clearLines(board);

						if (lines > 0) {
							score += getLineScore(lines);
							scoreText.text = `SCORE: ${score}`;
						}

						drawBoard(boardGraphics, board, CELL_SIZE);
						pieceGraphics.clear();

						const next = spawnPiece(randomPieceType());
						piece.type = next.type;
						piece.row = next.row;
						piece.col = next.col;
						piece.rotation = next.rotation;

						if (checkGameOver(piece, board)) {
							gameOver = true;
							gameOverText.visible = true;
							pieceGraphics.clear();
						} else {
							drawPiece(pieceGraphics, piece, CELL_SIZE);
						}

						dropAccumulator = 0;
						isLocking = false;
						lockAccumulator = 0;
					}
				}
			});

			function onKeyDown(e: KeyboardEvent) {
				if (gameOver) {
					if (e.key === "Enter") restartGame();
					return;
				}

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

					case "ArrowUp":
						e.preventDefault();
						{
							const newRotation = (piece.rotation + 1) % 4;
							const kick = canRotate(piece, newRotation, board);

							if (kick !== null) {
								piece.rotation = newRotation;
								piece.col += kick;
								drawPiece(pieceGraphics, piece, CELL_SIZE);
								isLocking = false;
								lockAccumulator = 0;
							}
						}
						break;
				}
			}

			function restartGame() {
				// Reset state
				Object.assign(board, createEmptyBoard());
				score = 0;
				dropAccumulator = 0;
				lockAccumulator = 0;
				isLocking = false;
				gameOver = false;

				// Reset visuals
				boardGraphics.clear();
				gameOverText.visible = false;
				scoreText.text = "SCORE: 0";

				// Spawn new piece
				const next = spawnPiece(randomPieceType());
				piece.type = next.type;
				piece.row = next.row;
				piece.col = next.col;
				piece.rotation = next.rotation;
				drawPiece(pieceGraphics, piece, CELL_SIZE);
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
