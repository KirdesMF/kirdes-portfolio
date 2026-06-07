import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useResizablePanels } from "#/terminal/use-resizable-panels";

function Harness() {
	const panels = useResizablePanels();

	return (
		<div data-testid="container" style={{ width: "1000px", height: "800px" }}>
			<span data-testid="terminal-size">{panels.terminalPaneSize}</span>
			<span data-testid="route-size">{panels.routePaneSize}</span>
			<button
				type="button"
				onPointerDown={(event) =>
					panels.startResize({
						axis: "horizontal",
						container: event.currentTarget.parentElement,
						event,
						target: "terminal",
					})
				}
			>
				terminal handle
			</button>
			<button
				type="button"
				onClick={(event) =>
					panels.resizeByKeyboard({
						container: event.currentTarget.parentElement,
						delta: 40,
						target: "route",
					})
				}
			>
				keyboard route
			</button>
		</div>
	);
}

function mockContainerRect(container: HTMLElement) {
	vi.spyOn(container, "getBoundingClientRect").mockReturnValue({
		bottom: 800,
		height: 800,
		left: 0,
		right: 1000,
		top: 0,
		width: 1000,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	});
}

afterEach(cleanup);

describe("useResizablePanels", () => {
	it("clamps and commits final pointer resize state", () => {
		render(<Harness />);
		const container = screen.getByTestId("container");
		mockContainerRect(container);
		Element.prototype.setPointerCapture = vi.fn();

		fireEvent.pointerDown(screen.getByRole("button", { name: "terminal handle" }), {
			clientX: 900,
			pointerId: 1,
		});
		fireEvent.pointerUp(window, { clientX: 900 });

		expect(screen.getByTestId("terminal-size").textContent).toBe("75");
		expect(container.style.getPropertyValue("--terminal-pane-size")).toBe("75%");
	});

	it("clamps keyboard resize state", () => {
		render(<Harness />);
		const container = screen.getByTestId("container");
		mockContainerRect(container);

		fireEvent.click(screen.getByRole("button", { name: "keyboard route" }));

		expect(screen.getByTestId("route-size").textContent).toBe("75");
		expect(container.style.getPropertyValue("--route-pane-size")).toBe("75%");
	});
});
