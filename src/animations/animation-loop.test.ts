import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type AnimationRenderer, startAnimationLoop } from "./animation-loop";

let nextFrameId: number;
let frames: Map<number, FrameRequestCallback>;
let resizeCallback: ResizeObserverCallback | undefined;

function createRenderer(): AnimationRenderer {
	return {
		resize: vi.fn(),
		render: vi.fn(),
		dispose: vi.fn(),
	};
}

function runNextFrame(timestamp: number) {
	const entry = frames.entries().next().value;
	if (!entry) throw new Error("Animation frame was not scheduled.");
	const [id, callback] = entry;
	frames.delete(id);
	callback(timestamp);
}

beforeEach(() => {
	nextFrameId = 1;
	frames = new Map();
	resizeCallback = undefined;
	Object.defineProperty(document, "fonts", {
		configurable: true,
		value: { ready: new Promise(() => undefined) },
	});
	vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
		const id = nextFrameId++;
		frames.set(id, callback);
		return id;
	});
	vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
	vi.stubGlobal(
		"ResizeObserver",
		class {
			constructor(callback: ResizeObserverCallback) {
				resizeCallback = callback;
			}
			observe() {}
			disconnect() {}
		},
	);
	vi.stubGlobal("matchMedia", () => ({
		matches: false,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
	}));
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe("startAnimationLoop", () => {
	it("starts without depending on window focus", () => {
		const focus = vi.spyOn(document, "hasFocus").mockReturnValue(false);
		const renderer = createRenderer();

		const stop = startAnimationLoop(renderer);
		runNextFrame(16);

		expect(focus).not.toHaveBeenCalled();
		expect(renderer.resize).toHaveBeenCalledOnce();
		expect(renderer.render).toHaveBeenCalledWith(16);
		stop();
	});

	it("keeps running through a transient zero-sized resize", () => {
		const renderer = createRenderer();
		const canvas = document.createElement("canvas");
		let width = 100;
		canvas.getBoundingClientRect = () => ({
			width,
			height: width > 0 ? 50 : 0,
			top: 0,
			right: width,
			bottom: width > 0 ? 50 : 0,
			left: 0,
			x: 0,
			y: 0,
			toJSON: () => undefined,
		});
		const stop = startAnimationLoop(renderer, canvas);

		runNextFrame(16);
		width = 0;
		resizeCallback?.([], {} as ResizeObserver);
		runNextFrame(32);
		expect(frames.size).toBe(1);

		width = 200;
		resizeCallback?.([], {} as ResizeObserver);
		runNextFrame(48);
		expect(renderer.resize).toHaveBeenCalledTimes(2);
		expect(renderer.render).toHaveBeenLastCalledWith(48);
		stop();
	});

	it("cancels work and disposes the renderer", () => {
		const renderer = createRenderer();
		const stop = startAnimationLoop(renderer);

		expect(frames.size).toBe(1);
		stop();
		expect(frames.size).toBe(0);
		expect(renderer.dispose).toHaveBeenCalledOnce();
	});
});
