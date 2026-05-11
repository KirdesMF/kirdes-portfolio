import { useState } from "react";

import { PIECE_DEFINITIONS, type PieceType, randomPieceType } from "./pieces";

const GRID_COLS = 10;
const GRID_ROWS = 20;
const CELL_SIZE = 28;

type ActivePiece = {
	type: PieceType;
	row: number;
	col: number;
};

// Spawn a piece centered at the top of the grid.
function spawnPiece(type: PieceType): ActivePiece {
	const shape = PIECE_DEFINITIONS[type].shape;
	const maxCol = Math.max(...shape.map(([, c]) => c));
	const col = Math.floor((GRID_COLS - (maxCol + 1)) / 2);
	const minRow = Math.min(...shape.map(([r]) => r));

	return { type, row: -minRow, col };
}

// Compute the set of "row-col" keys the piece occupies.
function buildOccupiedSet(piece: ActivePiece): Set<string> {
	const set = new Set<string>();
	const def = PIECE_DEFINITIONS[piece.type];

	for (const [dr, dc] of def.shape) {
		set.add(`${piece.row + dr}-${piece.col + dc}`);
	}

	return set;
}

export function TetrisGame() {
	const [active] = useState<ActivePiece>(() => spawnPiece(randomPieceType()));

	const occupied = buildOccupiedSet(active);

	return (
		<div className="flex h-dvh items-center justify-center bg-background">
			<div
				className="grid border border-border bg-background"
				style={{
					gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_SIZE}px)`,
					gridTemplateRows: `repeat(${GRID_ROWS}, ${CELL_SIZE}px)`,
				}}
			>
				{Array.from({ length: GRID_ROWS }, (_, y) =>
					Array.from({ length: GRID_COLS }, (_, x) => {
						const key = `${y}-${x}`;
						const isOccupied = occupied.has(key);

						return (
							<div
								key={key}
								className={isOccupied ? "" : "border-r border-b border-border/30"}
								style={{
									width: CELL_SIZE,
									height: CELL_SIZE,
									backgroundColor: isOccupied ? PIECE_DEFINITIONS[active.type].color : undefined,
								}}
							/>
						);
					}),
				)}
			</div>
		</div>
	);
}
