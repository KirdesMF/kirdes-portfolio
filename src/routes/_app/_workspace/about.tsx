import { createFileRoute } from "@tanstack/react-router";
import { useTrackRouteFile } from "#/editor/route-file-editor";

const fileId = "src/routes/about.md";

export const Route = createFileRoute("/_app/_workspace/about")({
	component: RouteComponent,
});

function RouteComponent() {
	useTrackRouteFile(fileId);

	return (
		<div className="relative size-full text-border/50">
			<svg
				aria-hidden="true"
				className="pointer-events-none absolute top-16 left-0 h-px w-full overflow-visible"
			>
				<line
					x1="0"
					x2="100%"
					y1="0"
					y2="0"
					stroke="currentColor"
					strokeDasharray="4 4"
					vectorEffect="non-scaling-stroke"
				/>
			</svg>
			<svg
				aria-hidden="true"
				className="pointer-events-none absolute bottom-16 left-0 h-px w-full overflow-visible"
			>
				<line
					x1="0"
					x2="100%"
					y1="0"
					y2="0"
					stroke="currentColor"
					strokeDasharray="4 4"
					vectorEffect="non-scaling-stroke"
				/>
			</svg>
			<svg
				aria-hidden="true"
				className="pointer-events-none absolute top-0 left-16 h-full w-px overflow-visible"
			>
				<line
					x1="0"
					x2="0"
					y1="0"
					y2="100%"
					stroke="currentColor"
					strokeDasharray="4 4"
					vectorEffect="non-scaling-stroke"
				/>
			</svg>
			<svg
				aria-hidden="true"
				className="pointer-events-none absolute top-0 right-16 h-full w-px overflow-visible"
			>
				<line
					x1="0"
					x2="0"
					y1="0"
					y2="100%"
					stroke="currentColor"
					strokeDasharray="4 4"
					vectorEffect="non-scaling-stroke"
				/>
			</svg>
		</div>
	);
}
