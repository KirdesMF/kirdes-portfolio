import { createFileRoute } from "@tanstack/react-router";
import { Terminal } from "#/terminal/Terminal";

export const Route = createFileRoute("/terminal")({
	validateSearch: (search: Record<string, unknown>) => ({
		file: typeof search.file === "string" ? search.file : undefined,
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { file } = Route.useSearch();

	return <Terminal fileName={file} />;
}
