import { createFileRoute } from "@tanstack/react-router";
import { WorkSection } from "#/browser/work/work-section";

export const Route = createFileRoute("/terminal/work/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <WorkSection />;
}
