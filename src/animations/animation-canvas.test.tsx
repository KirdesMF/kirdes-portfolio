import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AnimationCanvas } from "./animation-canvas";
import type { AnimationRenderer } from "./animation-loop";
import type { AnimationRoute } from "./webgl-text";

const { startAnimationLoop, stopAnimation } = vi.hoisted(() => {
	const stop = vi.fn();
	return {
		stopAnimation: stop,
		startAnimationLoop: vi.fn(() => stop),
	};
});

vi.mock("./animation-loop", () => ({ startAnimationLoop }));

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

describe("AnimationCanvas", () => {
	it("recreates its renderer after WebGL context restoration", () => {
		const renderer: AnimationRenderer = {
			resize: vi.fn(),
			render: vi.fn(),
			dispose: vi.fn(),
		};
		const route: AnimationRoute = {
			path: "/lab/test",
			label: "Test",
			mode: "test",
			createRenderer: vi.fn(() => renderer),
		};
		const { container } = render(<AnimationCanvas route={route} />);
		const originalCanvas = container.querySelector("canvas");
		if (!originalCanvas) throw new Error("Canvas was not rendered.");

		const contextLost = new Event("webglcontextlost", { cancelable: true });
		fireEvent(originalCanvas, contextLost);
		expect(contextLost.defaultPrevented).toBe(true);
		expect(stopAnimation).toHaveBeenCalledOnce();

		fireEvent(originalCanvas, new Event("webglcontextrestored"));
		const restoredCanvas = container.querySelector("canvas");
		expect(restoredCanvas).toBe(originalCanvas);
		expect(route.createRenderer).toHaveBeenCalledTimes(2);
		expect(startAnimationLoop).toHaveBeenCalledTimes(2);
	});
});
