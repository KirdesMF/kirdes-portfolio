import { createFileRoute } from "@tanstack/react-router";
import { WorkSection } from "#/portfolio/work/WorkSection";

export const Route = createFileRoute("/terminal/work/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <WorkSection />;
}
