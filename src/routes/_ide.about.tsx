import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_ide/about")({
	component: () => <Navigate search={{ file: "about/README.md" }} to="/editor" />,
});
