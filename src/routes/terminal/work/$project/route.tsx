import { createFileRoute } from "@tanstack/react-router";
import { WorkDetailPage } from "#/pages/WorkDetail";

export const Route = createFileRoute("/terminal/work/$project")({
	component: RouteComponent,
});

function RouteComponent() {
	const { project } = Route.useParams();

	return <WorkDetailPage project={project} />;
}
