import { createFileRoute } from "@tanstack/react-router";
import { AnimationCanvas, spotlightDecodeAnimation } from "#/animations";
import { EmptyEditor } from "#/editor/empty-editor";

export const Route = createFileRoute("/_app/home")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="relative size-full overflow-hidden bg-editor">
			<AnimationCanvas
				className="absolute inset-0 block size-full"
				route={spotlightDecodeAnimation}
			/>
			<div className="pointer-events-none relative z-10 size-full">
				<EmptyEditor />
			</div>
		</div>
	);
}
