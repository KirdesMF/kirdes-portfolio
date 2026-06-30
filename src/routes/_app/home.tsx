import { createFileRoute } from "@tanstack/react-router";
import { GridBackground } from "#/components/grid-background";
import { PixelTrailCanvas } from "#/components/pixel-trail-canvas";
import { EmptyEditor } from "#/editor/empty-editor";

export const Route = createFileRoute("/_app/home")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="relative size-full overflow-hidden">
			<PixelTrailCanvas className="pointer-events-none absolute inset-0 size-full" />
			<GridBackground />
			<div className="relative z-10 size-full">
				<EmptyEditor />
			</div>
		</div>
	);
}
