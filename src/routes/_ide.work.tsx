import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_ide/work")({
	component: () => <Navigate search={{ file: "work/README.md" }} to="/editor" />,
});
