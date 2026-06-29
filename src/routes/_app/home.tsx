import { createFileRoute } from "@tanstack/react-router";
import { GridBackground } from "#/components/grid-background";
import { EmptyEditor } from "#/editor/empty-editor";

export const Route = createFileRoute("/_app/home")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="relative size-full overflow-hidden">
			<GridBackground />
			<div className="relative z-10 size-full">
				<EmptyEditor />
			</div>
		</div>
	);
}
