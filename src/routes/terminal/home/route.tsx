import { createFileRoute } from "@tanstack/react-router";
import { HomeSection } from "#/portfolio/home/HomeSection";

export const Route = createFileRoute("/terminal/home")({
	component: RouteComponent,
});

function RouteComponent() {
	return <HomeSection />;
}
