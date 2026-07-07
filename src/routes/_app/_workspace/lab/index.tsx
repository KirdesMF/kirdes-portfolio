import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_workspace/lab/")({
	component: LabIndex,
});

function LabIndex() {
	return null;
}
