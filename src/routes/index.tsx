import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return <main className="min-h-0 overflow-hidden bg-background" />;
}
