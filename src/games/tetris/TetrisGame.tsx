import { Application, Container, Graphics } from "pixi.js";
import { useEffect, useRef } from "react";

import { PIECE_DEFINITIONS, type PieceType, randomPieceType } from "./pieces";

const CELL_SIZE = 28;
const GRID_COLS = 10;
const GRID_ROWS = 20;

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

	return { gridArea, pieceGraphics };
}

export function TetrisGame() {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		let app: Application | null = null;
		let cancelled = false;

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

			const { gridArea, pieceGraphics } = createScene();
			pixApp.stage.addChild(gridArea);

			// Spawn and render a random piece
			const piece = spawnPiece(randomPieceType());
			drawPiece(pieceGraphics, piece, CELL_SIZE);

			app = pixApp;
		}

		setupPixi();

		return () => {
			cancelled = true;
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
