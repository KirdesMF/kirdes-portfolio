import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { XIcon } from "lucide-react";
import { AnimationCanvas, getAnimationBySlug } from "#/animations";

export const Route = createFileRoute("/_app/_workspace/lab/$animationId")({
	component: AnimationRoute,
});

function AnimationRoute() {
	const { animationId } = Route.useParams();
	const animation = getAnimationBySlug(animationId);
	if (!animation) throw notFound();

	return (
		<article className="relative flex size-full min-h-[420px] flex-col items-center justify-center gap-8 overflow-auto bg-page p-6 sm:p-10">
			<h1 className="text-center font-serif font-bold text-[clamp(2.5rem,6vw,5rem)] leading-none tracking-[-0.04em]">
				{animation.label}
			</h1>
			<div className="relative h-[min(56vh,28rem)] w-[min(92%,42rem)] shrink-0 overflow-hidden border-border border-thin bg-background">
				<AnimationCanvas className="absolute inset-0 block size-full" route={animation} />
			</div>
			<Link
				aria-label="Close animation"
				className="absolute top-3 right-3 z-10 px-1 font-mono text-primary text-tiny leading-none focus:text-accent-foreground focus:outline-none hover:text-accent-foreground"
				to="/lab"
			>
				<span aria-hidden="true" className="flex items-center">
					[<XIcon className="size-3" />]
				</span>
			</Link>
		</article>
	);
}
