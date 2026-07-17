import { createFileRoute } from "@tanstack/react-router";
import { AnimationCanvas, spotlightDecodeAnimation } from "#/animations";
import { HomePage } from "#/components/home-page/home-page";

export const Route = createFileRoute("/_app/home")({
	component: HomeRoute,
});

function HomeRoute() {
	return (
		<div className="relative size-full overflow-hidden bg-page">
			<AnimationCanvas
				className="absolute inset-0 block size-full"
				route={spotlightDecodeAnimation}
			/>
			<div className="pointer-events-none relative z-10 size-full">
				<HomePage />
			</div>
		</div>
	);
}
