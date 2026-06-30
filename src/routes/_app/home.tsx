import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { PixelTrailCanvas } from "#/components/pixel-trail-canvas";
import { EmptyEditor } from "#/editor/empty-editor";

export const Route = createFileRoute("/_app/home")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="relative size-full overflow-hidden">
			<ClientOnly fallback={<div className="absolute inset-0 size-full bg-background" />}>
				<PixelTrailCanvas
					backgroundColor="var(--background)"
					className="pointer-events-none absolute inset-0 size-full"
				/>
			</ClientOnly>
			<div className="relative z-10 size-full">
				<EmptyEditor />
			</div>
		</div>
	);
}
