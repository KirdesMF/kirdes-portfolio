import { createFileRoute } from "@tanstack/react-router";
import { HomeSection } from "#/browser/home/home-section";

export const Route = createFileRoute("/terminal/home")({
	component: RouteComponent,
});

function RouteComponent() {
	return <HomeSection />;
}
