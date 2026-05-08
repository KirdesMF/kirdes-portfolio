import { createFileRoute } from "@tanstack/react-router";
import { Terminal } from "#/terminal/Terminal";

export const Route = createFileRoute("/terminal")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Terminal />;
}
