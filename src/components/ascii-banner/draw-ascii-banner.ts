import { type BannerArt, getCellKind } from "./banner-art";
import { mixColor } from "./colors";

export type AsciiBannerColors = {
	text: string;
	line: string;
	block: string;
	glow: string;
	background: string | null;
	shimmer: string;
};

export type AsciiBannerShimmer = {
	bandWidth: number;
	diagonalSkew: number;
	introDuration: number;
	loopDelay: number;
	secondSweepDelay: number;
	sweepDuration: number;
};

export type AsciiBannerEffects = {
	blurAlpha: number;
	blurFilter: number;
	blurShadow: number;
	glowAlpha: number;
	glowShadow: number;
};

export type DrawBannerOptions = {
	width: number;
	height: number;
	columns: number;
	rows: number;
	originX: number;
	originY: number;
	fontFamily: string;
	colors: AsciiBannerColors;
	effects: AsciiBannerEffects;
	shimmerConfig: AsciiBannerShimmer;
	time: number;
	shimmer: boolean;
	shimmerPosition: number | null;
	glow: boolean;
	blur: boolean;
};

function colorForKind(
	kind: ReturnType<typeof getCellKind>,
	colors: AsciiBannerColors,
	y: number,
	options: DrawBannerOptions,
) {
	if (kind === "block") {
		const verticalProgress = Math.max(
			0,
			Math.min(1, (y - options.originY) / Math.max(1, options.rows - 1)),
		);
		return mixColor(colors.text, colors.block, verticalProgress);
	}

	if (kind === "line") return colors.line;
	return colors.text;
}

function easeInOutCubic(value: number) {
	return value < 0.5 ? 4 * value * value * value : 1 - (-2 * value + 2) ** 3 / 2;
}

function drawCells(ctx: CanvasRenderingContext2D, art: BannerArt, options: DrawBannerOptions) {
	const cellWidth = options.width / options.columns;
	const cellHeight = options.height / options.rows;
	const fontSize = Math.max(1, cellHeight);

	ctx.font = `${fontSize}px ${options.fontFamily}`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	for (const cell of art.cells) {
		const [x, y, char, , explicitKind] = cell;
		const kind = explicitKind ?? getCellKind(char);
		const baseColor = colorForKind(kind, options.colors, y, options);

		let fill = baseColor;
		if (options.shimmer) {
			const { bandWidth, diagonalSkew, loopDelay, secondSweepDelay, sweepDuration } =
				options.shimmerConfig;
			const cycleDuration = secondSweepDelay + sweepDuration + loopDelay;
			const cycleTime = options.time % cycleDuration;
			const diagonalPosition = x - options.originX + (y - options.originY) * diagonalSkew;
			let intensity = 0;

			if (options.shimmerPosition !== null) {
				const bandPosition =
					-bandWidth + options.shimmerPosition * (options.columns + bandWidth * 2);
				const distance = Math.abs(diagonalPosition - bandPosition);
				intensity = Math.max(0, 1 - distance / bandWidth) ** 2;
			} else {
				for (const startTime of [0, secondSweepDelay]) {
					const sweepTime = cycleTime - startTime;
					if (sweepTime >= 0 && sweepTime < sweepDuration) {
						const progress = easeInOutCubic(sweepTime / sweepDuration);
						const bandPosition = -bandWidth + progress * (options.columns + bandWidth * 2);
						const distance = Math.abs(diagonalPosition - bandPosition);
						intensity = Math.max(intensity, Math.max(0, 1 - distance / bandWidth) ** 2);
					}
				}
			}

			if (intensity > 0) {
				fill = mixColor(baseColor, options.colors.shimmer, intensity);
			}
		}

		const cellX = (x - options.originX) * cellWidth;
		const cellY = (y - options.originY) * cellHeight;

		ctx.fillStyle = fill;

		if (kind === "block") {
			ctx.fillRect(cellX, cellY, cellWidth, cellHeight);
			continue;
		}

		ctx.fillText(char, cellX + cellWidth / 2, cellY + cellHeight / 2);
	}
}

export function drawAsciiBanner(
	ctx: CanvasRenderingContext2D,
	art: BannerArt,
	options: DrawBannerOptions,
) {
	ctx.clearRect(0, 0, options.width, options.height);

	if (options.colors.background) {
		ctx.fillStyle = options.colors.background;
		ctx.fillRect(0, 0, options.width, options.height);
	}

	if (options.blur) {
		ctx.save();
		ctx.globalAlpha = options.effects.blurAlpha;
		ctx.filter = `blur(${options.effects.blurFilter}px)`;
		ctx.shadowColor = options.colors.glow;
		ctx.shadowBlur = options.effects.blurShadow;
		drawCells(ctx, art, options);
		ctx.restore();
	}

	if (options.glow) {
		ctx.save();
		ctx.globalAlpha = options.effects.glowAlpha;
		ctx.shadowColor = options.colors.glow;
		ctx.shadowBlur = options.effects.glowShadow;
		drawCells(ctx, art, options);
		ctx.restore();
	}

	ctx.save();
	drawCells(ctx, art, options);
	ctx.restore();
}
