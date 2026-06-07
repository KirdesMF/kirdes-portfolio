import { createFileRoute } from "@tanstack/react-router";
import { AboutSection } from "#/browser/about/about-section";

export const Route = createFileRoute("/terminal/about")({
	component: RouteComponent,
});

function RouteComponent() {
	return <AboutSection />;
}
