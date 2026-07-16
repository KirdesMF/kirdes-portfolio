import { describe, expect, it } from "vitest";
import {
	createShuffle,
	createSolvedTiles,
	getMovableCells,
	isSolved,
	moveTile,
	shuffleTiles,
} from "./sliding-puzzle";

describe("sliding puzzle", () => {
	it("only moves tiles neighboring the empty cell", () => {
		const solved = createSolvedTiles(4);

		expect(moveTile(solved, 14, 4)).toEqual([...solved.slice(0, 14), 15, 14]);
		expect(moveTile(solved, 10, 4)).toBeNull();
	});

	it("finds movable cells without crossing rows", () => {
		expect(getMovableCells(12, 4)).toEqual([8, 13]);
		expect(getMovableCells(5, 4)).toEqual([1, 9, 4, 6]);
	});

	it("creates a shuffled permutation by legal moves", () => {
		const shuffled = shuffleTiles(4, () => 0.25);

		expect([...shuffled].sort((a, b) => a - b)).toEqual(createSolvedTiles(4));
		expect(isSolved(shuffled)).toBe(false);
	});

	it("records the moves needed to resolve a shuffle", () => {
		const shuffled = createShuffle(4, () => 0.25);
		const resolved = shuffled.solutionMoves.reduce(
			(tiles, cell) => moveTile(tiles, cell, 4) ?? tiles,
			shuffled.tiles,
		);

		expect(isSolved(resolved)).toBe(true);
	});
});
