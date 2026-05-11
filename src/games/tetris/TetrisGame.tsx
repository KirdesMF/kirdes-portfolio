import { Application, Container, Graphics } from "pixi.js";
import { useEffect, useRef } from "react";

const CELL_SIZE = 28;
const GRID_COLS = 10;
const GRID_ROWS = 20;

const GRID_WIDTH = GRID_COLS * CELL_SIZE;
const GRID_HEIGHT = GRID_ROWS * CELL_SIZE;

function createScene() {
	const gridArea = new Container();

	// Grid background and border
	const gridBg = new Graphics();
	gridBg.rect(0, 0, GRID_WIDTH, GRID_HEIGHT);
	gridBg.fill({ color: 0x16213e, alpha: 0.5 });
	gridBg.stroke({ width: 1, color: 0x334155 });
	gridArea.addChild(gridBg);

	return { gridArea };
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

			if (cancelled) {
				pixApp.destroy({ removeView: true, releaseGlobalResources: true }, { children: true });
				return;
			}

			const { gridArea } = createScene();
			pixApp.stage.addChild(gridArea);

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
