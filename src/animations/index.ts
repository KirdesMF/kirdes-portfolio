import { AsciiFluidAnimation } from "./modes/ascii-fluid";
import { AsciiTopographicAnimation } from "./modes/ascii-topographic";
import { BeadCurtainAnimation } from "./modes/bead-curtain";
import { CharEyeAnimation } from "./modes/char-eye";
import { CharRingsAnimation } from "./modes/char-rings";
import { CharactersLinesRepelAnimation } from "./modes/characters-lines-repel";
import { CornerSunburstAnimation } from "./modes/corner-sunburst";
import { DitherEyeAnimation } from "./modes/dither-eye";
import { DitherSmokeAnimation } from "./modes/dither-smoke";
import { ElasticAnimation } from "./modes/elastic";
import { GodLightAnimation } from "./modes/god-light";
import { InterferenceAnimation } from "./modes/interference";
import { RadarHaloAnimation } from "./modes/radar-halo";
import { ScanlineAnimation } from "./modes/scanline";
import { ScrambleAnimation } from "./modes/scramble";
import { SpotlightAnimation } from "./modes/spotlight";
import { SpotlightHiddenAnimation } from "./modes/spotlight-hidden";
import { SpringMeshAnimation } from "./modes/spring-mesh";

export type { AnimationRoute } from "./webgl-text";
export { AnimationCanvas } from "./webgl-text";

export const animationRoutes = [
	AsciiFluidAnimation,
	AsciiTopographicAnimation,
	BeadCurtainAnimation,
	CharEyeAnimation,
	CharRingsAnimation,
	CharactersLinesRepelAnimation,
	CornerSunburstAnimation,
	ScrambleAnimation,
	DitherEyeAnimation,
	DitherSmokeAnimation,
	ElasticAnimation,
	GodLightAnimation,
	SpotlightHiddenAnimation,
	InterferenceAnimation,
	RadarHaloAnimation,
	ScanlineAnimation,
	SpotlightAnimation,
	SpringMeshAnimation,
] as const;

export const scanlineRevealAnimation = ScanlineAnimation;
export const radarHaloAnimation = RadarHaloAnimation;
export const spotlightDecodeAnimation = SpotlightAnimation;

export function getAnimationBySlug(slug: string) {
	return animationRoutes.find((animation) => animation.path === `/lab/${slug}`);
}
