import { createFileRoute } from "@tanstack/react-router";
import { WorkDetailSection } from "#/browser/work/work-detail-section";

export const Route = createFileRoute("/terminal/work/$project")({
	component: RouteComponent,
});

function RouteComponent() {
	const { project } = Route.useParams();

	return <WorkDetailSection project={project} />;
}
