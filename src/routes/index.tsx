import { createFileRoute } from "@tanstack/react-router";

import { Terminal } from "#/terminal/Terminal";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Terminal />;
}
