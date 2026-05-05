import { BriefcaseBusiness, ChevronRight, CircleHelp, Code2, Mail, UserRound } from "lucide-react";

import { Separator } from "#/design-system/Separator";

const portfolioSections = [
	{ id: "about", label: "about", Icon: UserRound },
	{ id: "projects", label: "projects", Icon: BriefcaseBusiness },
	{ id: "skills", label: "skills", Icon: Code2 },
	{ id: "contact", label: "contact", Icon: Mail },
	{ id: "help-command", label: "help command", Icon: CircleHelp },
] as const;

export function EditorExplorer(): React.ReactNode {
	return (
		<div className="grid h-full min-w-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden text-xs">
			<header className="flex h-7 items-center border-b border-border px-2 font-medium text-muted-foreground uppercase tracking-wide">
				Workspace 1
			</header>
			<nav aria-label="Portfolio sections" className="min-h-0 overflow-hidden p-1.5">
				<ul>
					{portfolioSections.map(({ id, label, Icon }, index) => (
						<li key={id}>
							{index > 0 ? <Separator className="my-1" /> : null}
							<button
								className="flex h-9 w-full items-center gap-2 rounded-sm px-2 text-left text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-ring"
								type="button"
							>
								<span className="inline-flex size-5 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
									<Icon className="size-3.5" />
								</span>
								<span className="min-w-0 flex-1 truncate">{label}</span>
								<ChevronRight className="size-3.5 shrink-0" />
							</button>
						</li>
					))}
				</ul>
			</nav>
		</div>
	);
}
