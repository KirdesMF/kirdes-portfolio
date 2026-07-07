import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Folder, FolderOpen } from "lucide-react";
import { AnimationCanvas, scanlineRevealAnimation } from "#/animations";
import { cn } from "#/design-system/cn";

const experiments = [{ label: "Signal Room", to: "/lab/signal-room" }] as const;

export const Route = createFileRoute("/_app/_workspace/lab")({
	component: LabLayout,
});

function LabLayout() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const isLabIndex = pathname === "/lab";

	return (
		<div className="grid h-full min-h-0 grid-cols-1 overflow-hidden bg-editor font-mono text-tiny md:grid-cols-[minmax(14rem,1fr)_minmax(0,2fr)]">
			<aside
				className={cn(
					"min-h-0 border-border bg-background p-2 text-muted-foreground md:block md:border-r-thin",
					!isLabIndex && "hidden",
				)}
			>
				<nav className="grid gap-1">
					{experiments.map((experiment) => (
						<Link
							activeOptions={{ exact: true }}
							className="flex items-center gap-1.5 px-2 py-1 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
							key={experiment.to}
							to={experiment.to}
							activeProps={{ className: "bg-accent text-accent-foreground" }}
						>
							{({ isActive }) => (
								<>
									{isActive ? (
										<FolderOpen className="size-3 shrink-0" />
									) : (
										<Folder className="size-3 shrink-0" />
									)}
									<span>{experiment.label}</span>
								</>
							)}
						</Link>
					))}
				</nav>
			</aside>
			<section
				className={cn(
					"relative h-full min-h-[420px] min-w-0 md:min-h-0 md:block",
					isLabIndex ? "overflow-hidden" : "overflow-auto",
				)}
			>
				{isLabIndex ? (
					<>
						<AnimationCanvas
							className="absolute inset-0 block size-full"
							route={scanlineRevealAnimation}
						/>
						<div className="pointer-events-none absolute left-3 top-3 font-mono text-muted-foreground text-tiny uppercase">
							{scanlineRevealAnimation.label}
						</div>
					</>
				) : (
					<Outlet />
				)}
			</section>
		</div>
	);
}
