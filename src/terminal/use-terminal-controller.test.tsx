import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTerminalHistory } from "#/ide/terminal-history-store";
import { useTerminalController } from "./use-terminal-controller";

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
	useRouter: () => ({
		navigate: mockNavigate,
	}),
}));

beforeEach(() => {
	mockNavigate.mockClear();
	useTerminalHistory.setState({
		history: [],
		commandHistory: [],
	});
});

describe("useTerminalController", () => {
	it("handleSubmit('unknown') appends one history entry with the input", () => {
		const setMode = vi.fn();
		const { result } = renderHook(() => useTerminalController({ currentRoute: "/start", setMode }));

		act(() => {
			result.current.handleSubmit("unknown");
		});

		const history = result.current.history;
		expect(history).toHaveLength(1);
		expect(history[0]?.input).toBe("unknown");
	});

	it("handleSubmit('cd about') calls router navigate to /about", () => {
		const setMode = vi.fn();
		const { result } = renderHook(() => useTerminalController({ currentRoute: "/start", setMode }));

		act(() => {
			result.current.handleSubmit("cd about");
		});

		expect(mockNavigate).toHaveBeenCalledWith(expect.objectContaining({ to: "/about" }));
	});
});
