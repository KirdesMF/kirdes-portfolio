export type PieceType = "I" | "O" | "T" | "S" | "Z" | "L" | "J";

/** Cell offsets [row, col] relative to the piece's position. */
export type Shape = Array<[number, number]>;

type PieceDefinition = {
	shapes: [Shape, Shape, Shape, Shape];
	color: number;
};

export const PIECE_DEFINITIONS: Record<PieceType, PieceDefinition> = {
	I: {
		shapes: [
			[
				[0, 0],
				[0, 1],
				[0, 2],
				[0, 3],
			],
			[
				[0, 3],
				[1, 3],
				[2, 3],
				[3, 3],
			],
			[
				[3, 0],
				[3, 1],
				[3, 2],
				[3, 3],
			],
			[
				[0, 0],
				[1, 0],
				[2, 0],
				[3, 0],
			],
		],
		color: 0x00bcd4,
	},
	O: {
		shapes: [
			[
				[0, 0],
				[0, 1],
				[1, 0],
				[1, 1],
			],
			[
				[0, 0],
				[0, 1],
				[1, 0],
				[1, 1],
			],
			[
				[0, 0],
				[0, 1],
				[1, 0],
				[1, 1],
			],
			[
				[0, 0],
				[0, 1],
				[1, 0],
				[1, 1],
			],
		],
		color: 0xf5cd47,
	},
	T: {
		shapes: [
			[
				[0, 0],
				[0, 1],
				[0, 2],
				[1, 1],
			],
			[
				[0, 2],
				[1, 1],
				[1, 2],
				[2, 2],
			],
			[
				[1, 1],
				[2, 0],
				[2, 1],
				[2, 2],
			],
			[
				[0, 0],
				[1, 0],
				[1, 1],
				[2, 0],
			],
		],
		color: 0x9b59b6,
	},
	S: {
		shapes: [
			[
				[0, 1],
				[0, 2],
				[1, 0],
				[1, 1],
			],
			[
				[0, 1],
				[1, 1],
				[1, 2],
				[2, 2],
			],
			[
				[1, 1],
				[1, 2],
				[2, 0],
				[2, 1],
			],
			[
				[0, 0],
				[1, 0],
				[1, 1],
				[2, 1],
			],
		],
		color: 0x2ecc71,
	},
	Z: {
		shapes: [
			[
				[0, 0],
				[0, 1],
				[1, 1],
				[1, 2],
			],
			[
				[0, 2],
				[1, 1],
				[1, 2],
				[2, 1],
			],
			[
				[1, 0],
				[1, 1],
				[2, 1],
				[2, 2],
			],
			[
				[0, 1],
				[1, 0],
				[1, 1],
				[2, 0],
			],
		],
		color: 0xe74c3c,
	},
	L: {
		shapes: [
			[
				[0, 0],
				[0, 1],
				[0, 2],
				[1, 0],
			],
			[
				[0, 1],
				[0, 2],
				[1, 2],
				[2, 2],
			],
			[
				[1, 2],
				[2, 0],
				[2, 1],
				[2, 2],
			],
			[
				[0, 0],
				[1, 0],
				[2, 0],
				[2, 1],
			],
		],
		color: 0xf39c12,
	},
	J: {
		shapes: [
			[
				[0, 0],
				[0, 1],
				[0, 2],
				[1, 2],
			],
			[
				[0, 2],
				[1, 2],
				[2, 1],
				[2, 2],
			],
			[
				[1, 0],
				[2, 0],
				[2, 1],
				[2, 2],
			],
			[
				[0, 0],
				[0, 1],
				[1, 0],
				[2, 0],
			],
		],
		color: 0x3498db,
	},
};

export const PIECE_TYPES: Array<PieceType> = ["I", "O", "T", "S", "Z", "L", "J"];

export function randomPieceType(): PieceType {
	return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
}
