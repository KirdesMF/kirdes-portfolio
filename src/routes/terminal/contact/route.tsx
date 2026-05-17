import { createFileRoute } from "@tanstack/react-router";
import { ContactSection } from "#/portfolio/contact/ContactSection";

export const Route = createFileRoute("/terminal/contact")({
	component: RouteComponent,
});

function RouteComponent() {
	return <ContactSection />;
}
