import { createFileRoute } from "@tanstack/react-router";

import { TerminalFooter } from "#/terminal/TerminalFooter";
import { TerminalPrompt } from "#/terminal/TerminalPrompt";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-1 flex-col">
			<div className="min-h-0 flex-1 overflow-y-auto p-3 text-sm" />
			<div className="shrink-0">
				<TerminalPrompt />
				<TerminalFooter />
			</div>
		</div>
	);
}
