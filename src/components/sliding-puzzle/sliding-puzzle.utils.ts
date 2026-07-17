const SHUFFLE_MOVES = 160;

export function createSolvedTiles(size: number) {
	return Array.from({ length: size * size }, (_, index) => index);
}

export function getMovableCells(emptyCell: number, size: number) {
	const row = Math.floor(emptyCell / size);
	const column = emptyCell % size;
	const cells: number[] = [];
	if (row > 0) cells.push(emptyCell - size);
	if (row < size - 1) cells.push(emptyCell + size);
	if (column > 0) cells.push(emptyCell - 1);
	if (column < size - 1) cells.push(emptyCell + 1);
	return cells;
}

export function moveTile(tiles: readonly number[], cell: number, size: number) {
	const emptyTile = size * size - 1;
	const emptyCell = tiles.indexOf(emptyTile);
	if (!getMovableCells(emptyCell, size).includes(cell)) return null;

	const next = [...tiles];
	[next[cell], next[emptyCell]] = [next[emptyCell], next[cell]];
	return next;
}

export function isSolved(tiles: readonly number[]) {
	return tiles.every((tile, cell) => tile === cell);
}

export function createShuffle(size: number, random = Math.random) {
	let tiles = createSolvedTiles(size);
	let previousEmptyCell = -1;
	const solutionMoves: number[] = [];

	for (let move = 0; move < SHUFFLE_MOVES; move++) {
		const emptyCell = tiles.indexOf(size * size - 1);
		const movable = getMovableCells(emptyCell, size).filter((cell) => cell !== previousEmptyCell);
		const cell = movable[Math.floor(random() * movable.length)];
		previousEmptyCell = emptyCell;
		tiles = moveTile(tiles, cell, size) ?? tiles;
		solutionMoves.unshift(emptyCell);
	}

	if (isSolved(tiles)) {
		const emptyCell = tiles.indexOf(size * size - 1);
		tiles = moveTile(tiles, getMovableCells(emptyCell, size)[0], size) ?? tiles;
		solutionMoves.unshift(emptyCell);
	}
	return { tiles, solutionMoves };
}

export function shuffleTiles(size: number, random = Math.random) {
	return createShuffle(size, random).tiles;
}
