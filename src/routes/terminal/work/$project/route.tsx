import { createFileRoute } from "@tanstack/react-router";
import { WorkDetailSection } from "#/portfolio/work/WorkDetailSection";

export const Route = createFileRoute("/terminal/work/$project")({
	component: RouteComponent,
});

function RouteComponent() {
	const { project } = Route.useParams();

	return <WorkDetailSection project={project} />;
}
