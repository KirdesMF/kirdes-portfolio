import { createEmptyGrid } from "./grid";

const GRID_COLS = 10;
const GRID_ROWS = 20;
const CELL_SIZE = 28;

export function TetrisGame() {
	const grid = createEmptyGrid();

	return (
		<div className="flex h-dvh items-center justify-center bg-background">
			<div
				className="grid border border-border bg-background"
				style={{
					gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_SIZE}px)`,
					gridTemplateRows: `repeat(${GRID_ROWS}, ${CELL_SIZE}px)`,
				}}
			>
				{grid.map((row, y) =>
					row.map((_cell, x) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: grid position is stable
							key={`${y}-${x}`}
							className="border-r border-b border-border/30"
							style={{ width: CELL_SIZE, height: CELL_SIZE }}
						/>
					)),
				)}
			</div>
		</div>
	);
}
