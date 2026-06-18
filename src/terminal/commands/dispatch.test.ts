import { describe, expect, it, vi } from "vitest";
import type { EditorFileEntry } from "#/editor/editor-files.types";
import type { CommandContext } from "./command.types";
import { dispatch } from "./dispatch";

function makeFakeFile(overrides?: Partial<EditorFileEntry>): EditorFileEntry {
	return {
		id: "~/README.md",
		name: "README.md",
		folder: "~",
		route: "/readme",
		...overrides,
	};
}

function makeCtx(raw: string, overrides?: Partial<CommandContext>): CommandContext {
	const normalized = raw.trim().toLowerCase();

	return {
		raw,
		normalized,
		pushHistory: overrides?.pushHistory ?? vi.fn(),
		navigate: overrides?.navigate ?? vi.fn(),
		reload: overrides?.reload ?? vi.fn(),
		currentRoute: overrides?.currentRoute ?? "/start",
		resolveFile: overrides?.resolveFile ?? (() => null),
		lsFiles: overrides?.lsFiles ?? (() => ({ folders: [], files: [] })),
		commandHistory: overrides?.commandHistory ?? [],
		clearHistory: overrides?.clearHistory ?? vi.fn(),
		setMode: overrides?.setMode ?? vi.fn(),
	};
}

describe("dispatch", () => {
	it("unknown command pushes 'command not found' and does not navigate", () => {
		const pushHistory = vi.fn();
		const navigate = vi.fn();
		const ctx = makeCtx("blarg", { pushHistory, navigate });

		dispatch(ctx);

		expect(pushHistory).toHaveBeenCalledTimes(1);
		expect(pushHistory).toHaveBeenCalledWith("command not found: blarg");
		expect(navigate).not.toHaveBeenCalled();
	});

	it("slash route /about navigates to /about", () => {
		const pushHistory = vi.fn();
		const navigate = vi.fn();
		const ctx = makeCtx("/about", { pushHistory, navigate });

		dispatch(ctx);

		expect(pushHistory).toHaveBeenCalledTimes(1);
		expect(pushHistory).toHaveBeenCalledWith("opening /about");
		expect(navigate).toHaveBeenCalledWith("/about");
	});

	it("cd about pushes opening message and navigates to /about", () => {
		const pushHistory = vi.fn();
		const navigate = vi.fn();
		const ctx = makeCtx("cd about", { pushHistory, navigate });

		dispatch(ctx);

		expect(pushHistory).toHaveBeenCalledTimes(1);
		expect(pushHistory).toHaveBeenCalledWith("opening about");
		expect(navigate).toHaveBeenCalledWith("/about");
	});

	it("cd missing pushes 'directory not found' and does not navigate", () => {
		const pushHistory = vi.fn();
		const navigate = vi.fn();
		const ctx = makeCtx("cd missing", { pushHistory, navigate });

		dispatch(ctx);

		expect(pushHistory).toHaveBeenCalledTimes(1);
		expect(pushHistory).toHaveBeenCalledWith("directory not found: missing");
		expect(navigate).not.toHaveBeenCalled();
	});

	it("cat README.md with a resolved file pushes JSX output", () => {
		const pushHistory = vi.fn();
		const resolveFile = vi.fn().mockReturnValue(makeFakeFile());
		const ctx = makeCtx("cat README.md", { pushHistory, resolveFile });

		dispatch(ctx);

		expect(resolveFile).toHaveBeenCalledWith("readme.md", "/start");
		expect(pushHistory).toHaveBeenCalledTimes(1);
		// Should push a JSX element, not a string
		expect(typeof pushHistory.mock.calls[0]?.[0]).toBe("object");
	});

	it("cat missing.md pushes a not-found message", () => {
		const pushHistory = vi.fn();
		const resolveFile = vi.fn().mockReturnValue(null);
		const ctx = makeCtx("cat missing.md", { pushHistory, resolveFile });

		dispatch(ctx);

		expect(pushHistory).toHaveBeenCalledTimes(1);
		// Not-found message via paraglide — should be a non-empty string
		const output = pushHistory.mock.calls[0]?.[0];
		expect(typeof output).toBe("string");
		expect((output as string).length).toBeGreaterThan(0);
	});

	it("exit navigates to /start", () => {
		const navigate = vi.fn();
		const ctx = makeCtx("exit", { navigate, pushHistory: vi.fn() });

		dispatch(ctx);

		expect(navigate).toHaveBeenCalledWith("/start");
	});

	it("clear calls clearHistory", () => {
		const clearHistory = vi.fn();
		const ctx = makeCtx("clear", { clearHistory });

		dispatch(ctx);

		expect(clearHistory).toHaveBeenCalledTimes(1);
	});

	it("mode dark calls setMode('dark')", () => {
		const setMode = vi.fn();
		const pushHistory = vi.fn();
		const ctx = makeCtx("mode dark", { setMode, pushHistory });

		dispatch(ctx);

		expect(setMode).toHaveBeenCalledWith("dark");
		// mode handler also pushes a JSX element
		expect(typeof pushHistory.mock.calls[0]?.[0]).toBe("object");
	});
});
