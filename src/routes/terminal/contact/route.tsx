import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "#/pages/Contact";

export const Route = createFileRoute("/terminal/contact")({
	component: RouteComponent,
});

function RouteComponent() {
	return <ContactPage />;
}
