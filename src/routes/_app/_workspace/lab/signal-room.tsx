import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_workspace/lab/signal-room")({
	component: ExperimentRoute,
});

function ExperimentRoute() {
	return (
		<article className="relative min-h-full w-full p-8 font-mono text-foreground">
			<Link
				aria-label="Close experiment"
				className="absolute top-6 right-6 px-1 text-primary text-tiny leading-none focus:text-accent-foreground focus:outline-none hover:text-accent-foreground"
				to="/lab"
			>
				[X]
			</Link>
			<div className="mx-auto grid min-h-full w-full max-w-2xl content-center gap-4">
				<p className="text-muted-foreground text-tiny">~/lab/signal-room</p>
				<h1 className="font-normal text-xl uppercase tracking-wide">
					<span className="text-muted-foreground/35">##</span> Signal Room
				</h1>
				<p className="max-w-xl text-muted-foreground text-xs leading-6">
					A fake lab route for now. This will become an experiment page once lab content is finalized.
				</p>
			</div>
		</article>
	);
}
