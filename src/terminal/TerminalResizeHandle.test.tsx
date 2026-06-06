import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TerminalResizeHandle } from "#/terminal/TerminalResizeHandle";

afterEach(cleanup);

describe("TerminalResizeHandle", () => {
	it("renders an accessible vertical separator", () => {
		render(<TerminalResizeHandle axis="horizontal" value={50} onResizeStart={vi.fn()} />);

		const handle = screen.getByRole("separator", { name: "Resize terminal and browser panes" });
		expect(handle.getAttribute("aria-orientation")).toBe("vertical");
		expect(handle.getAttribute("aria-valuenow")).toBe("50");
		expect(handle.getAttribute("class")).toContain("cursor-col-resize");
	});

	it("renders an accessible horizontal separator", () => {
		render(<TerminalResizeHandle axis="vertical" value={50} onResizeStart={vi.fn()} />);

		const handle = screen.getByRole("separator", { name: "Resize browser and editor panes" });
		expect(handle.getAttribute("aria-orientation")).toBe("horizontal");
		expect(handle.getAttribute("class")).toContain("cursor-row-resize");
	});

	it("supports arrow key resizing", () => {
		const onKeyResize = vi.fn();
		render(
			<TerminalResizeHandle
				axis="horizontal"
				value={50}
				onKeyResize={onKeyResize}
				onResizeStart={vi.fn()}
			/>,
		);

		fireEvent.keyDown(screen.getByRole("separator"), { key: "ArrowRight" });
		fireEvent.keyDown(screen.getByRole("separator"), { key: "ArrowLeft", shiftKey: true });

		expect(onKeyResize).toHaveBeenNthCalledWith(1, 2);
		expect(onKeyResize).toHaveBeenNthCalledWith(2, -10);
	});
});
