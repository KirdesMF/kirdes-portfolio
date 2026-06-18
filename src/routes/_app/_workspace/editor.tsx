import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_workspace/editor")({
	component: () => <Navigate replace to="/start" />,
});
