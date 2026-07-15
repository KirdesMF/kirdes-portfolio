export type BannerCellKind = "text" | "line" | "block";

export type BannerCell = readonly [
	x: number,
	y: number,
	char: string,
	colorIndex?: number,
	kind?: BannerCellKind,
];

export type BannerArt = {
	columns: number;
	rows: number;
	originX: number;
	originY: number;
	cellWidth: number;
	cellHeight: number;
	cells: readonly BannerCell[];
};

export const BANNER_GLYPHS = {
	C: [" ██████╗", "██╔════╝", "██║     ", "██║     ", "╚██████╗", " ╚═════╝"],
	D: ["██████╗ ", "██╔══██╗", "██║  ██║", "██║  ██║", "██████╔╝", "╚═════╝ "],
	E: ["███████╗", "██╔════╝", "█████╗  ", "██╔══╝  ", "███████╗", "╚══════╝"],
	I: ["██╗", "██║", "██║", "██║", "██║", "╚═╝"],
	R: ["██████╗ ", "██╔══██╗", "██████╔╝", "██╔══██╗", "██║  ██║", "╚═╝  ╚═╝"],
} as const;

type BannerGlyph = keyof typeof BANNER_GLYPHS;

export function createBannerArt(text: string): BannerArt {
	const originX = 20;
	const originY = 8;
	const cells: BannerCell[] = [];
	let offsetX = 0;

	for (const character of text) {
		const glyph = BANNER_GLYPHS[character as BannerGlyph];
		if (!glyph) throw new Error(`Unsupported banner character: ${character}`);

		for (const [row, line] of glyph.entries()) {
			for (const [column, char] of [...line].entries()) {
				if (char !== " ") cells.push([originX + offsetX + column, originY + row, char, 0]);
			}
		}

		offsetX += [...glyph[0]].length;
	}

	return {
		columns: offsetX,
		rows: 6,
		originX,
		originY,
		cellWidth: 10.8,
		cellHeight: 18,
		cells,
	};
}

export function getCellKind(char: string): BannerCellKind {
	if (char === "█") return "block";
	if ("═║╔╗╚╝╦╩╠╣╬─│┌┐└┘┬┴├┤┼".includes(char)) return "line";
	return "text";
}
