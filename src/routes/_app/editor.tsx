import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/editor")({
	component: () => <Navigate replace to="/start" />,
});
