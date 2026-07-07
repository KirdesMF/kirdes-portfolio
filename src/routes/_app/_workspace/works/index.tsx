import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_workspace/works/")({
	component: WorksIndex,
});

function WorksIndex() {
	return null;
}
