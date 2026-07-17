import { createFileRoute, Link } from "@tanstack/react-router";
import { CloseIcon } from "#/icons/close";

export const Route = createFileRoute("/_app/_workspace/works/portfolio-os")({
	component: ProjectRoute,
});

function ProjectRoute() {
	return (
		<article className="relative min-h-full w-full p-8 font-mono text-foreground">
			<Link
				aria-label="Close project"
				className="absolute top-6 right-6 px-1 text-primary text-tiny leading-none focus:text-accent-foreground focus:outline-none hover:text-accent-foreground"
				to="/works"
			>
				<span aria-hidden="true" className="flex items-center">
					[<CloseIcon className="size-3" />]
				</span>
			</Link>
			<div className="mx-auto grid min-h-full w-full max-w-2xl content-center gap-4">
				<p className="text-muted-foreground text-tiny">~/works/portfolio-os</p>
				<h1 className="font-normal text-xl uppercase tracking-wide">
					<span className="text-muted-foreground/35">##</span> Portfolio OS
				</h1>
				<p className="max-w-xl text-muted-foreground text-xs leading-6">
					A fake project route for now. This will become a real case study once project names and
					content are finalized.
				</p>
			</div>
		</article>
	);
}
