export type PieceType = "I" | "O" | "T" | "S" | "Z" | "L" | "J";

/** Cell offsets [row, col] relative to the piece's top-left position. */
type Shape = Array<[number, number]>;

type PieceDefinition = {
	shape: Shape;
	color: string;
};

export const PIECE_DEFINITIONS: Record<PieceType, PieceDefinition> = {
	I: {
		shape: [
			[0, 0],
			[0, 1],
			[0, 2],
			[0, 3],
		],
		color: "oklch(0.7 0.18 200)",
	},
	O: {
		shape: [
			[0, 0],
			[0, 1],
			[1, 0],
			[1, 1],
		],
		color: "oklch(0.82 0.16 95)",
	},
	T: {
		shape: [
			[0, 0],
			[0, 1],
			[0, 2],
			[1, 1],
		],
		color: "oklch(0.6 0.18 300)",
	},
	S: {
		shape: [
			[0, 1],
			[0, 2],
			[1, 0],
			[1, 1],
		],
		color: "oklch(0.65 0.18 145)",
	},
	Z: {
		shape: [
			[0, 0],
			[0, 1],
			[1, 1],
			[1, 2],
		],
		color: "oklch(0.65 0.2 25)",
	},
	L: {
		shape: [
			[0, 0],
			[0, 1],
			[0, 2],
			[1, 0],
		],
		color: "oklch(0.7 0.18 65)",
	},
	J: {
		shape: [
			[0, 0],
			[0, 1],
			[0, 2],
			[1, 2],
		],
		color: "oklch(0.6 0.17 255)",
	},
};

export const PIECE_TYPES: Array<PieceType> = ["I", "O", "T", "S", "Z", "L", "J"];

export function randomPieceType(): PieceType {
	return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
}
