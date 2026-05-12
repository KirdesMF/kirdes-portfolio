import { Application, Container, Graphics, Text } from "pixi.js";
import { useEffect, useRef } from "react";

import { type Board, type BoardCell, createEmptyBoard, drawBoard } from "./board";
import { PIECE_DEFINITIONS, type PieceType, randomPieceType, type Shape } from "./pieces";

const CELL_SIZE = 28;
const GRID_COLS = 10;
const GRID_ROWS = 20;
const LOCK_DELAY_MS = 300;

const GRID_WIDTH = GRID_COLS * CELL_SIZE;
const GRID_HEIGHT = GRID_ROWS * CELL_SIZE;

const GAP = 16;
const SIDE_PANEL_WIDTH = 100;
const PREVIEW_CELL_SIZE = 16;

const CANVAS_WIDTH = GRID_WIDTH + GAP + SIDE_PANEL_WIDTH;
const CANVAS_HEIGHT = GRID_HEIGHT;

function getCSSColor(variable: string): number {
	const raw = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

	// Hex value — direct parse
	if (raw.startsWith("#")) return parseInt(raw.slice(1), 16);

	// Variable reference — resolve via DOM
	if (raw.startsWith("var(")) {
		const probe = document.createElement("div");
		probe.style.position = "absolute";
		probe.style.pointerEvents = "none";
		probe.style.opacity = "0";
		probe.style.setProperty("color", variable, "");
		document.body.appendChild(probe);
		const rgb = getComputedStyle(probe).color;
		document.body.removeChild(probe);
		const [r, g, b] = rgb.match(/\d+/g)?.map(Number) ?? [0, 0, 0];
		return (r << 16) | (g << 8) | b;
	}

	// OKLCH — parse and convert to sRGB
	const match = raw.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
	if (match) {
		const l = Number.parseFloat(match[1]);
		const c = Number.parseFloat(match[2]);
		const h = Number.parseFloat(match[3]) * (Math.PI / 180);

		// OKLCH → OKLab
		const a = c * Math.cos(h);
		const b = c * Math.sin(h);

		// OKLab → linear sRGB
		const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
		const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
		const s_ = l - 0.0894841775 * a - 1.291485548 * b;

		const l_cubed = l_ * l_ * l_;
		const m_cubed = m_ * m_ * m_;
		const s_cubed = s_ * s_ * s_;

		const r_ = +4.0767416621 * l_cubed - 3.3077115913 * m_cubed + 0.2309699292 * s_cubed;
		const g_ = -1.2684380046 * l_cubed + 2.6097574011 * m_cubed - 0.3413193965 * s_cubed;
		const b_ = -0.0041960863 * l_cubed - 0.7034186147 * m_cubed + 1.707614701 * s_cubed;

		const r8 = Math.round(Math.max(0, Math.min(1, r_)) * 255);
		const g8 = Math.round(Math.max(0, Math.min(1, g_)) * 255);
		const b8 = Math.round(Math.max(0, Math.min(1, b_)) * 255);

		return (r8 << 16) | (g8 << 8) | b8;
	}

	return 0x000000;
}

let GRID_BG_COLOR = 0x0f1720;
let GRID_BORDER_COLOR = 0x334155;
let GRID_LINE_COLOR = 0x334155;
let TETRIS_TEXT_MUTED = 0x94a3b8;
let TETRIS_TEXT_BRIGHT = 0xf8fafc;
let TETRIS_OVER_COLOR = 0xef4444;
let PIECE_COLOR = 0x4ade80;
let PIECE_STROKE_COLOR = 0xffffff;

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
	if (canPlace(piece, newRotation, 0, 0, board)) return 0;
	if (canPlace(piece, newRotation, 0, -1, board)) return -1;
	if (canPlace(piece, newRotation, 0, 1, board)) return 1;

	return null;
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

	for (const [dr, dc] of shape) {
		const r = piece.row + dr;
		const c = piece.col + dc;
		board[r][c] = PIECE_COLOR;
	}
}

// Remove full rows and shift everything above down.
function clearLines(board: Board): number {
	let cleared = 0;

	for (let r = GRID_ROWS - 1; r >= 0; r--) {
		if (board[r].every((cell) => cell !== null)) {
			board.splice(r, 1);
			board.unshift(Array<BoardCell>(GRID_COLS).fill(null));
			cleared++;
			r++;
		}
	}

	return cleared;
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
	const shape: Shape = PIECE_DEFINITIONS[piece.type].shapes[piece.rotation];

	for (const [dr, dc] of shape) {
		const x = (piece.col + dc) * cellSize;
		const y = (piece.row + dr) * cellSize;
		g.rect(x, y, cellSize, cellSize);
		g.fill(PIECE_COLOR);
		g.stroke({ width: 1, color: PIECE_STROKE_COLOR, alpha: 0.3 });
	}
}

// Compute the row where the piece would land if dropped straight down.
function getGhostRow(piece: ActivePiece, board: Board): number {
	let row = piece.row;

	while (canPlace(piece, piece.rotation, row - piece.row + 1, 0, board)) {
		row++;
	}

	return row;
}

function drawGhost(g: Graphics, piece: ActivePiece, ghostRow: number, cellSize: number): void {
	g.clear();
	const shape: Shape = PIECE_DEFINITIONS[piece.type].shapes[piece.rotation];

	for (const [dr, dc] of shape) {
		const x = (piece.col + dc) * cellSize;
		const y = (ghostRow + dr) * cellSize;
		g.rect(x, y, cellSize, cellSize);
		g.stroke({ width: 1, color: PIECE_STROKE_COLOR, alpha: 0.12 });
	}
}

function drawPreview(g: Graphics, type: PieceType, cellSize: number): void {
	g.clear();
	const shape: Shape = PIECE_DEFINITIONS[type].shapes[0];

	for (const [dr, dc] of shape) {
		g.rect(dc * cellSize, dr * cellSize, cellSize, cellSize);
		g.fill(PIECE_COLOR);
		g.stroke({ width: 1, color: PIECE_STROKE_COLOR, alpha: 0.3 });
	}
}

function createGridBackground(): Graphics {
	const g = new Graphics();

	g.rect(0, 0, GRID_WIDTH, GRID_HEIGHT);
	g.fill({ color: GRID_BG_COLOR });
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

	g.stroke({ width: 0.5, color: GRID_LINE_COLOR, alpha: 0.5 });

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

function createNextLabel(): Text {
	return new Text({
		text: "NEXT",
		style: {
			fontFamily: "monospace",
			fontSize: 12,
			fill: 0x94a3b8,
		},
		x: 8,
		y: 8,
	});
}

function createCountdownText(): Text {
	return new Text({
		text: "",
		style: {
			fontFamily: "monospace",
			fontSize: 48,
			fill: 0xffffff,
			fontWeight: "bold",
		},
		anchor: { x: 0.5, y: 0.5 },
		x: GRID_WIDTH / 2,
		y: GRID_HEIGHT / 2,
	});
}

function createStartText(): Text {
	const text = new Text({
		text: "TETRIS",
		style: {
			fontFamily: "monospace",
			fontSize: 36,
			fill: 0x00bcd4,
			fontWeight: "bold",
		},
		anchor: { x: 0.5, y: 0.5 },
		x: GRID_WIDTH / 2,
		y: GRID_HEIGHT / 2 - 20,
	});

	return text;
}

function createStartSubText(): Text {
	const text = new Text({
		text: "PRESS ENTER TO START",
		style: {
			fontFamily: "monospace",
			fontSize: 12,
			fill: 0x94a3b8,
		},
		anchor: { x: 0.5, y: 0.5 },
		x: GRID_WIDTH / 2,
		y: GRID_HEIGHT / 2 + 14,
	});

	return text;
}

function createPauseText(): Text {
	const text = new Text({
		text: "PAUSED",
		style: {
			fontFamily: "monospace",
			fontSize: 24,
			fill: 0x94a3b8,
			fontWeight: "bold",
		},
		anchor: { x: 0.5, y: 0.5 },
		x: GRID_WIDTH / 2,
		y: GRID_HEIGHT / 2,
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

const LEVEL_SPEEDS = [1000, 800, 650, 500, 370, 250, 160, 100];

function getDropInterval(level: number): number {
	const idx = Math.min(level - 1, LEVEL_SPEEDS.length - 1);
	return LEVEL_SPEEDS[idx];
}

function createScene() {
	const gridArea = new Container();
	const gameContent = new Container();
	const sideArea = new Container();

	const boardLayer = new Container();
	const boardGraphics = new Graphics();
	boardLayer.addChild(boardGraphics);

	const activePieceLayer = new Container();
	const pieceGraphics = new Graphics();
	activePieceLayer.addChild(pieceGraphics);

	const ghostGraphics = new Graphics();

	const scoreText = createScoreText();
	const gridBgGraphics = createGridBackground();
	const gridLineGraphics = createGridLines();

	const gameOverText = createGameOverText();
	gameOverText.visible = false;

	const pauseText = createPauseText();
	pauseText.visible = false;

	const pauseOverlay = new Graphics();
	pauseOverlay.rect(0, 0, CANVAS_WIDTH, GRID_HEIGHT);
	pauseOverlay.fill({ color: 0x000000, alpha: 0.6 });
	pauseOverlay.visible = false;

	const startText = createStartText();
	const startSubText = createStartSubText();
	const countdownText = createCountdownText();
	countdownText.visible = false;

	const holdLabel = new Text({
		text: "HOLD",
		style: {
			fontFamily: "monospace",
			fontSize: 12,
			fill: 0x94a3b8,
		},
		x: 8,
		y: 0,
	});

	const holdGraphics = new Graphics();
	holdGraphics.x = 8;
	holdGraphics.y = 20;

	const nextLabel = createNextLabel();
	const previewGraphics = new Graphics();
	nextLabel.y = 78;
	previewGraphics.y = 96;
	previewGraphics.x = 8;

	const levelLabel = new Text({
		text: "LEVEL",
		style: {
			fontFamily: "monospace",
			fontSize: 12,
			fill: 0x94a3b8,
		},
		x: 8,
		y: 170,
	});

	const levelText = new Text({
		text: "1",
		style: {
			fontFamily: "monospace",
			fontSize: 16,
			fill: 0xffffff,
			fontWeight: "bold",
		},
		x: 8,
		y: 186,
	});

	const linesLabel = new Text({
		text: "LINES",
		style: {
			fontFamily: "monospace",
			fontSize: 12,
			fill: 0x94a3b8,
		},
		x: 8,
		y: 228,
	});

	const linesText = new Text({
		text: "0",
		style: {
			fontFamily: "monospace",
			fontSize: 16,
			fill: 0xffffff,
			fontWeight: "bold",
		},
		x: 8,
		y: 244,
	});

	sideArea.addChild(holdLabel);
	sideArea.addChild(holdGraphics);
	sideArea.addChild(nextLabel);
	sideArea.addChild(previewGraphics);
	sideArea.addChild(levelLabel);
	sideArea.addChild(levelText);
	sideArea.addChild(linesLabel);
	sideArea.addChild(linesText);

	sideArea.x = GRID_WIDTH + GAP;
	sideArea.y = 0;

	gameContent.addChild(gridBgGraphics);
	gameContent.addChild(gridLineGraphics);
	gameContent.addChild(boardLayer);
	gameContent.addChild(ghostGraphics);
	gameContent.addChild(activePieceLayer);
	gameContent.addChild(scoreText);
	gameContent.addChild(gameOverText);
	gameContent.addChild(sideArea);

	gridArea.addChild(gameContent);
	gridArea.addChild(pauseText);
	gridArea.addChild(startText);
	gridArea.addChild(startSubText);
	gridArea.addChild(countdownText);

	return {
		gridArea,
		pieceGraphics,
		boardGraphics,
		scoreText,
		gameOverText,
		pauseText,
		startText,
		startSubText,
		countdownText,
		previewGraphics,
		levelText,
		linesText,
		holdGraphics,
		ghostGraphics,
		gridBgGraphics,
		gridLineGraphics,
		holdLabel,
		nextLabel,
		levelLabel,
		linesLabel,
	};
}

export function TetrisGame() {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		let app: Application | null = null;
		let cancelled = false;
		let removeKeyboard: (() => void) | null = null;
		let themeObserver: MutationObserver | null = null;

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

			const {
				gridArea,
				pieceGraphics,
				boardGraphics,
				scoreText,
				gameOverText,
				pauseText,
				startText,
				startSubText,
				countdownText,
				previewGraphics,
				levelText,
				linesText,
				holdGraphics,
				ghostGraphics,
				gridBgGraphics,
				gridLineGraphics,
				holdLabel,
				nextLabel,
				levelLabel,
				linesLabel,
			} = createScene();
			pixApp.stage.addChild(gridArea);

			// Game state (mutable, driven by ticker and input)
			let score = 0;
			let level = 1;
			let linesTotal = 0;
			let dropAccumulator = 0;
			let lockAccumulator = 0;
			let isLocking = false;
			let gameOver = false;
			let isHardDropping = false;
			let hardDropTarget = 0;
			let lockFlashAccumulator = 0;
			let started = false;
			let paused = false;
			const board: Board = createEmptyBoard();
			const piece: ActivePiece = spawnPiece(randomPieceType());
			let nextType: PieceType = randomPieceType();
			let heldType: PieceType | null = null;
			let canHold = true;
			let combo = 0;
			const popups: Array<{
				text: Text;
				birth: number;
				y: number;
			}> = [];

			function applyThemeColors() {
				GRID_BG_COLOR = getCSSColor("--tetris-grid-bg");
				GRID_BORDER_COLOR = getCSSColor("--tetris-grid-border");
				GRID_LINE_COLOR = getCSSColor("--tetris-grid-line");
				TETRIS_TEXT_MUTED = getCSSColor("--tetris-text-muted");
				TETRIS_TEXT_BRIGHT = getCSSColor("--tetris-text-bright");
				TETRIS_OVER_COLOR = getCSSColor("--tetris-over");
				PIECE_COLOR = getCSSColor("--tetris-piece");
				PIECE_STROKE_COLOR = getCSSColor("--tetris-piece-stroke");

				gridBgGraphics.clear();
				gridBgGraphics.rect(0, 0, GRID_WIDTH, GRID_HEIGHT);
				gridBgGraphics.fill({ color: GRID_BG_COLOR });
				gridBgGraphics.stroke({ width: 1, color: GRID_BORDER_COLOR });

				gridLineGraphics.clear();
				for (let x = CELL_SIZE; x < GRID_WIDTH; x += CELL_SIZE) {
					gridLineGraphics.moveTo(x, 0);
					gridLineGraphics.lineTo(x, GRID_HEIGHT);
				}
				for (let y = CELL_SIZE; y < GRID_HEIGHT; y += CELL_SIZE) {
					gridLineGraphics.moveTo(0, y);
					gridLineGraphics.lineTo(GRID_WIDTH, y);
				}
				gridLineGraphics.stroke({ width: 0.5, color: GRID_LINE_COLOR, alpha: 0.5 });

				// Update only the fill property, preserve rest of style
				(scoreText.style as Record<string, unknown>).fill = TETRIS_TEXT_MUTED;
				(pauseText.style as Record<string, unknown>).fill = TETRIS_TEXT_MUTED;
				(holdLabel.style as Record<string, unknown>).fill = TETRIS_TEXT_MUTED;
				(nextLabel.style as Record<string, unknown>).fill = TETRIS_TEXT_MUTED;
				(levelLabel.style as Record<string, unknown>).fill = TETRIS_TEXT_MUTED;
				(linesLabel.style as Record<string, unknown>).fill = TETRIS_TEXT_MUTED;
				(startText.style as Record<string, unknown>).fill = PIECE_COLOR;
				(startSubText.style as Record<string, unknown>).fill = TETRIS_TEXT_MUTED;
				(levelText.style as Record<string, unknown>).fill = TETRIS_TEXT_BRIGHT;
				(linesText.style as Record<string, unknown>).fill = TETRIS_TEXT_BRIGHT;
				(gameOverText.style as Record<string, unknown>).fill = TETRIS_OVER_COLOR;
			}

			applyThemeColors();

			// Piece not drawn yet — it will be drawn after the countdown
			drawPreview(previewGraphics, nextType, PREVIEW_CELL_SIZE);

			themeObserver = new MutationObserver(() => {
				if (cancelled) return;
				applyThemeColors();
			});
			themeObserver.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ["class"],
			});

			function updateGhost() {
				if (gameOver) {
					ghostGraphics.clear();
					return;
				}

				const ghostRow = getGhostRow(piece, board);
				drawGhost(ghostGraphics, piece, ghostRow, CELL_SIZE);
			}

			// Ghost not drawn here — it will be drawn after the countdown

			function doLock() {
				placePiece(piece, board);
				const lines = clearLines(board);

				if (lines > 0) {
					combo = Math.min(combo + 1, 10);
					const lineScore = getLineScore(lines);
					const totalAdd = lineScore * combo;

					score += totalAdd;
					scoreText.text = `SCORE: ${score}`;

					// Show floating popup
					const popupText = combo > 1 ? `+${totalAdd}x${combo}` : `+${totalAdd}`;

					const popup = new Text({
						text: popupText,
						style: {
							fontFamily: "monospace",
							fontSize: 16,
							fill: TETRIS_TEXT_BRIGHT,
							fontWeight: "bold",
						},
						anchor: { x: 0.5, y: 0.5 },
						x: GRID_WIDTH / 2,
						y: GRID_HEIGHT / 2,
					});

					gridArea.addChild(popup);
					popups.push({ text: popup, birth: performance.now(), y: GRID_HEIGHT / 2 });

					linesTotal += lines;
					linesText.text = String(linesTotal);
					const newLevel = Math.floor(linesTotal / 10) + 1;

					if (newLevel !== level) {
						level = newLevel;
						levelText.text = String(level);
					}
				} else {
					combo = 0;
				}

				pieceGraphics.alpha = 1;
				canHold = true;
				drawBoard(boardGraphics, board, CELL_SIZE, {
					strokeColor: PIECE_STROKE_COLOR,
					strokeAlpha: 0.3,
				});
				pieceGraphics.clear();

				const next = spawnPiece(nextType);
				piece.type = next.type;
				piece.row = next.row;
				piece.col = next.col;
				piece.rotation = next.rotation;
				nextType = randomPieceType();
				drawPreview(previewGraphics, nextType, PREVIEW_CELL_SIZE);

				if (checkGameOver(piece, board)) {
					gameOver = true;
					gameOverText.visible = true;
				}

				drawPiece(pieceGraphics, piece, CELL_SIZE);
				updateGhost();

				dropAccumulator = 0;
				isLocking = false;
				lockAccumulator = 0;
			}

			pixApp.ticker.add((ticker) => {
				if (gameOver || paused || !started) return;

				// Animate popups
				const now = performance.now();
				for (let i = popups.length - 1; i >= 0; i--) {
					const p = popups[i];
					const elapsed = now - p.birth;
					const duration = 800;

					if (elapsed >= duration) {
						gridArea.removeChild(p.text);
						p.text.destroy();
						popups.splice(i, 1);
						continue;
					}

					const t = elapsed / duration;
					p.text.y = p.y - t * 60;
					p.text.alpha = 1 - t;
				}

				if (isHardDropping) {
					piece.row++;
					drawPiece(pieceGraphics, piece, CELL_SIZE);
					updateGhost();

					if (piece.row >= hardDropTarget || !canMove(piece, 1, 0, board)) {
						isHardDropping = false;
						doLock();
					}

					return;
				}

				const canFall = canMove(piece, 1, 0, board);

				if (canFall) {
					isLocking = false;
					lockAccumulator = 0;
					pieceGraphics.alpha = 1;

					dropAccumulator += ticker.deltaMS;

					const interval = getDropInterval(level);

					if (dropAccumulator >= interval) {
						dropAccumulator -= interval;
						piece.row++;
						drawPiece(pieceGraphics, piece, CELL_SIZE);
						updateGhost();
					}
				} else {
					if (!isLocking) {
						isLocking = true;
						lockAccumulator = 0;
						lockFlashAccumulator = 0;
					}

					lockAccumulator += ticker.deltaMS;
					lockFlashAccumulator += ticker.deltaMS;

					// Flash piece during lock delay
					if (lockFlashAccumulator >= 150) {
						lockFlashAccumulator = 0;
						pieceGraphics.alpha = pieceGraphics.alpha === 1 ? 0.3 : 1;
					}

					if (lockAccumulator >= LOCK_DELAY_MS) {
						doLock();
					}
				}
			});

			function restartGame() {
				paused = false;
				pauseText.visible = false;

				gridArea.addChildAt(gameContent, 0);
				Object.assign(board, createEmptyBoard());
				score = 0;
				combo = 0;
				level = 1;
				linesTotal = 0;
				levelText.text = "1";
				linesText.text = "0";
				dropAccumulator = 0;
				lockAccumulator = 0;
				isLocking = false;
				isHardDropping = false;
				gameOver = false;

				// Remove any active popups
				for (const p of popups) {
					gridArea.removeChild(p.text);
					p.text.destroy();
				}
				popups.length = 0;

				boardGraphics.clear();
				gameOverText.visible = false;
				scoreText.text = "SCORE: 0";
				heldType = null;
				canHold = true;
				holdGraphics.clear();

				const next = spawnPiece(randomPieceType());
				piece.type = next.type;
				piece.row = next.row;
				piece.col = next.col;
				piece.rotation = next.rotation;
				nextType = randomPieceType();
				drawPiece(pieceGraphics, piece, CELL_SIZE);
				updateGhost();
				drawPreview(previewGraphics, nextType, PREVIEW_CELL_SIZE);
			}

			function startGame() {
				startText.visible = false;
				startSubText.visible = false;

				const countdown = ["3", "2", "1", "0"];
				let cdIndex = 0;

				countdownText.visible = true;
				(countdownText.style as Record<string, unknown>).fill = PIECE_COLOR;

				function tickCountdown() {
					if (cancelled) return;

					countdownText.text = countdown[cdIndex];
					cdIndex++;

					if (cdIndex < countdown.length) {
						setTimeout(tickCountdown, 800);
					} else {
						countdownText.visible = false;
						drawPiece(pieceGraphics, piece, CELL_SIZE);
						updateGhost();
						started = true;
					}
				}

				tickCountdown();
			}

			function onKeyDown(e: KeyboardEvent) {
				if (!started) {
					if (e.key === "Enter") startGame();
					return;
				}

				if (gameOver) {
					if (e.key === "Enter") restartGame();
					return;
				}

				if (e.key === "Escape") {
					e.preventDefault();
					paused = !paused;
					pauseText.visible = paused;

					if (paused) {
						gridArea.removeChild(gameContent);
					} else {
						gridArea.addChildAt(gameContent, 0);
					}

					return;
				}

				if (paused) return;

				switch (e.key) {
					case "ArrowLeft":
						e.preventDefault();
						pieceGraphics.alpha = 1;
						if (canMove(piece, 0, -1, board)) {
							piece.col--;
							drawPiece(pieceGraphics, piece, CELL_SIZE);
							updateGhost();
							isLocking = false;
							lockAccumulator = 0;
						}
						break;

					case "ArrowRight":
						e.preventDefault();
						pieceGraphics.alpha = 1;
						if (canMove(piece, 0, 1, board)) {
							piece.col++;
							drawPiece(pieceGraphics, piece, CELL_SIZE);
							updateGhost();
							isLocking = false;
							lockAccumulator = 0;
						}
						break;

					case "ArrowDown":
						e.preventDefault();
						pieceGraphics.alpha = 1;
						if (canMove(piece, 1, 0, board)) {
							piece.row++;
							dropAccumulator = 0;
							drawPiece(pieceGraphics, piece, CELL_SIZE);
							updateGhost();
							isLocking = false;
							lockAccumulator = 0;
						}
						break;

					case "ArrowUp":
						e.preventDefault();
						pieceGraphics.alpha = 1;
						{
							const newRotation = (piece.rotation + 1) % 4;
							const kick = canRotate(piece, newRotation, board);

							if (kick !== null) {
								piece.rotation = newRotation;
								piece.col += kick;
								drawPiece(pieceGraphics, piece, CELL_SIZE);
								updateGhost();
								isLocking = false;
								lockAccumulator = 0;
							}
						}
						break;

					case " ":
						e.preventDefault();
						if (!isHardDropping) {
							isHardDropping = true;
							hardDropTarget = getGhostRow(piece, board);
						}
						break;

					case "c":
						e.preventDefault();
						if (canHold) {
							canHold = false;
							isHardDropping = false;
							isLocking = false;
							lockAccumulator = 0;

							if (heldType === null) {
								heldType = piece.type;
								const newPiece = spawnPiece(randomPieceType());
								piece.type = newPiece.type;
								piece.row = newPiece.row;
								piece.col = newPiece.col;
								piece.rotation = newPiece.rotation;
							} else {
								const swapType = heldType;
								heldType = piece.type;
								const newPiece = spawnPiece(swapType);
								piece.type = newPiece.type;
								piece.row = newPiece.row;
								piece.col = newPiece.col;
								piece.rotation = newPiece.rotation;
							}

							drawPiece(pieceGraphics, piece, CELL_SIZE);
							updateGhost();
							drawPreview(holdGraphics, heldType, PREVIEW_CELL_SIZE);
							dropAccumulator = 0;
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
			themeObserver?.disconnect();
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
			style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
		>
			<canvas ref={canvasRef} />
		</div>
	);
}
