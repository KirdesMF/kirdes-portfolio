import { describe, expect, it } from "vitest";

import {
	animationRoutes,
	radarHaloAnimation,
	scanlineRevealAnimation,
	spotlightDecodeAnimation,
} from "./index";

describe("webgl text animations", () => {
	it("registers each animation once", () => {
		const modes = animationRoutes.map((route) => route.mode);

		expect(animationRoutes).toHaveLength(18);
		expect(new Set(modes).size).toBe(animationRoutes.length);
		expect(modes).not.toEqual(
			expect.arrayContaining([
				"wave-text",
				"text-waterfall",
				"magnetic",
				"gravity",
				"repulsive",
				"elastic-tear",
				"slinky",
				"glass-lens",
			]),
		);
	});

	it("sorts lab animations alphabetically", () => {
		const labels = animationRoutes.map((route) => route.label);
		expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b)));
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
		expect(spotlightDecodeAnimation).toMatchObject({
			label: "Spotlight Decode",
			mode: "spotlight",
		});
	});
});
