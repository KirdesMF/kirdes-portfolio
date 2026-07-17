import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Folder, FolderOpen } from "lucide-react";
import { AnimationCanvas, radarHaloAnimation } from "#/animations";
import { cn } from "#/design-system/cn";

const projects = [{ label: "Portfolio OS", to: "/works/portfolio-os" }] as const;

export const Route = createFileRoute("/_app/_workspace/works")({
	component: WorksLayout,
});

function WorksLayout() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const normalizedPathname = pathname.replace(/\/$/, "");
	const isWorksIndex = normalizedPathname === "/works";

	return (
		<div className="grid h-full min-h-0 grid-cols-1 overflow-hidden bg-page font-mono text-tiny md:grid-cols-[minmax(14rem,1fr)_minmax(0,2fr)]">
			<aside
				className={cn(
					"min-h-0 border-border bg-background p-2 text-muted-foreground md:block md:border-r-thin",
					!isWorksIndex && "hidden",
				)}
			>
				<nav className="grid gap-1">
					{projects.map((project) => (
						<Link
							activeOptions={{ exact: true }}
							className="flex items-center gap-1.5 px-2 py-1 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
							key={project.to}
							to={project.to}
							activeProps={{ className: "bg-accent text-accent-foreground" }}
						>
							{({ isActive }) => (
								<>
									{isActive ? (
										<FolderOpen className="size-3 shrink-0" />
									) : (
										<Folder className="size-3 shrink-0" />
									)}
									<span>{project.label}</span>
								</>
							)}
						</Link>
					))}
				</nav>
			</aside>
			<section
				className={cn(
					"relative h-full min-h-[420px] min-w-0 md:min-h-0 md:block",
					isWorksIndex ? "overflow-hidden" : "overflow-auto",
				)}
			>
				{isWorksIndex ? (
					<>
						<AnimationCanvas
							className="absolute inset-0 block size-full"
							route={radarHaloAnimation}
						/>
						<div className="pointer-events-none absolute left-3 top-3 font-mono text-muted-foreground text-tiny uppercase">
							{radarHaloAnimation.label}
						</div>
						<p
							aria-hidden="true"
							className="pointer-events-none absolute bottom-0 left-4 select-none font-serif font-extrabold text-[clamp(5rem,16vw,13rem)] text-muted-foreground/5 leading-[0.7] tracking-[-0.06em] sm:left-8"
						>
							Works
						</p>
					</>
				) : (
					<Outlet />
				)}
			</section>
		</div>
	);
}
