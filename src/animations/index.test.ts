import { describe, expect, it } from "vitest";

import { animationRoutes, radarHaloAnimation, scanlineRevealAnimation } from "./index";

describe("webgl text animations", () => {
	it("registers each animation once", () => {
		const modes = animationRoutes.map((route) => route.mode);

		expect(animationRoutes).toHaveLength(23);
		expect(new Set(modes).size).toBe(animationRoutes.length);
	});

	it("exports route-specific animations", () => {
		expect(scanlineRevealAnimation).toMatchObject({
			label: "Scanline Reveal",
			mode: "scanline",
		});
		expect(radarHaloAnimation).toMatchObject({
			label: "Radar Halo",
			mode: "radar-halo",
		});
	});
});
