import { createFileRoute } from "@tanstack/react-router";
import { AboutSection } from "#/portfolio/about/AboutSection";

export const Route = createFileRoute("/terminal/about")({
	component: RouteComponent,
});

function RouteComponent() {
	return <AboutSection />;
}
