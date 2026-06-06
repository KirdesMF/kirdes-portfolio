import type { AsciiBannerColors, AsciiBannerEffects, AsciiBannerShimmer } from "./drawAsciiBanner";

export const DEFAULT_BANNER_COLORS: AsciiBannerColors = {
	text: "var(--ascii-banner-text)",
	line: "var(--ascii-banner-line)",
	block: "var(--ascii-banner-block)",
	glow: "var(--ascii-banner-glow)",
	background: null,
	shimmer: "var(--ascii-banner-shimmer)",
};

export const DEFAULT_BANNER_SHIMMER: AsciiBannerShimmer = {
	bandWidth: 4,
	diagonalSkew: 0.75,
	introDuration: 1.41,
	loopDelay: 2.2,
	secondSweepDelay: 0.46,
	sweepDuration: 0.95,
};

export const DEFAULT_BANNER_EFFECTS: AsciiBannerEffects = {
	blurAlpha: 0.32,
	blurFilter: 7,
	blurShadow: 18,
	glowAlpha: 0.68,
	glowShadow: 14,
};

export const ASCII_BANNER_FONT_FAMILY =
	"SF Mono, Monaco, Cascadia Code, Consolas, JetBrains Mono, Fira Code, Monaspace Neon, Geist Mono, Courier New, monospace";

export const ASCII_BANNER_MAX_DPR = 1.5;
export const ASCII_BANNER_FRAME_INTERVAL_MS = 33;
