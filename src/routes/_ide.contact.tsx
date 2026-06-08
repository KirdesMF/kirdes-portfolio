import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_ide/contact")({
	component: () => <Navigate search={{ file: "contact/README.md" }} to="/editor" />,
});
