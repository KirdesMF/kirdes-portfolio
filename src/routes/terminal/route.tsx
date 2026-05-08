import { createFileRoute } from "@tanstack/react-router";
import { Terminal } from "#/terminal/Terminal";
import { parseTerminalPanelName } from "#/terminal/terminal-panel-types";

export const Route = createFileRoute("/terminal")({
	validateSearch: (search: Record<string, unknown>) => ({
		file: typeof search.file === "string" ? search.file : undefined,
		panel: parseTerminalPanelName(search.panel),
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { file, panel } = Route.useSearch();

	return <Terminal activePanel={panel} fileName={file} />;
}
