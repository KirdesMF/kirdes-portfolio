import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "#/pages/About";

export const Route = createFileRoute("/terminal/about")({
	component: RouteComponent,
});

function RouteComponent() {
	return <AboutPage />;
}
