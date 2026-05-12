export type PieceType = "I" | "O" | "T" | "S" | "Z" | "L" | "J";

/** Cell offsets [row, col] relative to the piece's top-left position. */
type Shape = Array<[number, number]>;

type PieceDefinition = {
	shape: Shape;
	color: number;
};

export const PIECE_DEFINITIONS: Record<PieceType, PieceDefinition> = {
	I: {
		shape: [
			[0, 0],
			[0, 1],
			[0, 2],
			[0, 3],
		],
		color: 0x00bcd4,
	},
	O: {
		shape: [
			[0, 0],
			[0, 1],
			[1, 0],
			[1, 1],
		],
		color: 0xf5cd47,
	},
	T: {
		shape: [
			[0, 0],
			[0, 1],
			[0, 2],
			[1, 1],
		],
		color: 0x9b59b6,
	},
	S: {
		shape: [
			[0, 1],
			[0, 2],
			[1, 0],
			[1, 1],
		],
		color: 0x2ecc71,
	},
	Z: {
		shape: [
			[0, 0],
			[0, 1],
			[1, 1],
			[1, 2],
		],
		color: 0xe74c3c,
	},
	L: {
		shape: [
			[0, 0],
			[0, 1],
			[0, 2],
			[1, 0],
		],
		color: 0xf39c12,
	},
	J: {
		shape: [
			[0, 0],
			[0, 1],
			[0, 2],
			[1, 2],
		],
		color: 0x3498db,
	},
};

export const PIECE_TYPES: Array<PieceType> = ["I", "O", "T", "S", "Z", "L", "J"];

export function randomPieceType(): PieceType {
	return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
}
