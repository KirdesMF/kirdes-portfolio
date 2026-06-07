import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SourceLinks } from "#/browser/source-links";
import { ScrambleText } from "#/design-system/scramble-text";
import { m } from "#/paraglide/messages";
import { showRoutePanelSearch } from "#/terminal/terminal-search-transitions";
import { workspaceViewMetadata } from "#/workspace/workspace-catalogue";
import { projects, statusColors } from "./work.data";

const meta = workspaceViewMetadata["/terminal/work"];

export function WorkSection(): ReactNode {
	return (
		<div className="flex flex-1 flex-col gap-3 p-4 text-xs">
			<div className="text-muted-foreground">{m.work_comment()}</div>

			<table className="w-full border-collapse">
				<thead>
					<tr className="border-b border-border text-left text-tiny text-muted-foreground/70">
						<th className="whitespace-nowrap pb-1.5 pr-4 font-medium">{m.work_column_name()}</th>
						<th className="whitespace-nowrap pb-1.5 pr-4 font-medium">{m.work_column_version()}</th>
						<th className="whitespace-nowrap pb-1.5 pr-4 font-medium">{m.work_column_status()}</th>
						<th className="pb-1.5 font-medium">{m.work_column_description()}</th>
					</tr>
				</thead>
				<tbody>
					{projects.map((entry) => (
						<tr key={entry.name} className="border-b border-border/50 last:border-none">
							<td className="whitespace-nowrap py-1.5 pr-4">
								<Link
									className="text-primary underline-offset-2 hover:underline"
									to="/terminal/work/$project"
									params={{ project: entry.name }}
									search={showRoutePanelSearch}
								>
									<ScrambleText text={entry.name} />
								</Link>
							</td>
							<td className="whitespace-nowrap py-1.5 pr-4 text-muted-foreground">
								{entry.version}
							</td>
							<td className={`whitespace-nowrap py-1.5 pr-4 ${statusColors[entry.status]}`}>
								{entry.status}
							</td>
							<td className="py-1.5 text-muted-foreground">{entry.description}</td>
						</tr>
					))}
				</tbody>
			</table>

			<p className="text-muted-foreground">{m.work_guidance()}</p>

			{meta ? <SourceLinks meta={meta} to="/terminal/work" /> : null}
		</div>
	);
}
