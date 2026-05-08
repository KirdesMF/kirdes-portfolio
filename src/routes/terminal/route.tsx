import { createFileRoute } from "@tanstack/react-router";
import { Terminal } from "#/terminal/Terminal";
import { parseTerminalSearch } from "#/terminal/terminal-search";

export const Route = createFileRoute("/terminal")({
	validateSearch: parseTerminalSearch,
	component: RouteComponent,
});

function RouteComponent() {
	const { dialog, file, files, panel } = Route.useSearch();

	return (
		<Terminal
			activeDialog={dialog}
			activeFileName={file}
			activePanel={panel}
			openFileNames={files}
		/>
	);
}
