import { AsciiFluidAnimation } from "./modes/ascii-fluid";
import { AsciiTopographicAnimation } from "./modes/ascii-topographic";
import { CharEyeAnimation } from "./modes/char-eye";
import { CornerSunburstAnimation } from "./modes/corner-sunburst";
import { DitherEyeAnimation } from "./modes/dither-eye";
import { DitherSmokeAnimation } from "./modes/dither-smoke";
import { ElasticAnimation } from "./modes/elastic";
import { ElasticTearAnimation } from "./modes/elastic-tear";
import { GodLightAnimation } from "./modes/god-light";
import { GravityAnimation } from "./modes/gravity";
import { InterferenceAnimation } from "./modes/interference";
import { MagneticAnimation } from "./modes/magnetic";
import { RadarAnimation } from "./modes/radar";
import { RadarHaloAnimation } from "./modes/radar-halo";
import { RepulsiveAnimation } from "./modes/repulsive";
import { ScanlineAnimation } from "./modes/scanline";
import { ScrambleAnimation } from "./modes/scramble";
import { SlinkyAnimation } from "./modes/slinky";
import { SpotlightAnimation } from "./modes/spotlight";
import { SpotlightHiddenAnimation } from "./modes/spotlight-hidden";
import { SpringMeshAnimation } from "./modes/spring-mesh";
import { TextWaterfallAnimation } from "./modes/text-waterfall";
import { WaveTextAnimation } from "./modes/wave-text";

export type { AnimationRoute } from "./webgl-text";
export { AnimationCanvas } from "./webgl-text";

export const animationRoutes = [
	ScrambleAnimation,
	SpotlightAnimation,
	SpotlightHiddenAnimation,
	GodLightAnimation,
	CornerSunburstAnimation,
	DitherEyeAnimation,
	DitherSmokeAnimation,
	CharEyeAnimation,
	AsciiTopographicAnimation,
	AsciiFluidAnimation,
	WaveTextAnimation,
	TextWaterfallAnimation,
	ElasticAnimation,
	MagneticAnimation,
	GravityAnimation,
	RepulsiveAnimation,
	ElasticTearAnimation,
	SpringMeshAnimation,
	SlinkyAnimation,
	InterferenceAnimation,
	RadarAnimation,
	RadarHaloAnimation,
	ScanlineAnimation,
] as const;

export const scanlineRevealAnimation = ScanlineAnimation;
export const radarHaloAnimation = RadarHaloAnimation;
