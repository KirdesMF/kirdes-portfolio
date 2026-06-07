import { createFileRoute } from "@tanstack/react-router";
import { ContactSection } from "#/browser/contact/contact-section";

export const Route = createFileRoute("/terminal/contact")({
	component: RouteComponent,
});

function RouteComponent() {
	return <ContactSection />;
}
