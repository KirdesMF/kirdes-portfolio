import { createFileRoute, Outlet } from "@tanstack/react-router";
import { TerminalLayout } from "#/terminal/TerminalLayout";
import { parseTerminalSearch } from "#/terminal/terminal-search";

export const Route = createFileRoute("/terminal")({
	validateSearch: parseTerminalSearch,
	component: RouteComponent,
});

function RouteComponent() {
	const { dialog, editor, files, panel } = Route.useSearch();

	return (
		<TerminalLayout
			activeDialog={dialog}
			activeEditor={editor}
			activePanel={panel}
			openFileNames={files}
		>
			<Outlet />
		</TerminalLayout>
	);
}
