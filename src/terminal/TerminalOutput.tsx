import { useEffect, useMemo, useRef } from "react";
import type { TerminalEntry } from "#/terminal/TerminalPrompt";

type TerminalEntryGroup = Array<TerminalEntry>;

type TerminalOutputLine = {
	content: string;
	id: string;
};

function groupEntries(entries: ReadonlyArray<TerminalEntry>): Array<TerminalEntryGroup> {
	const groups: Array<TerminalEntryGroup> = [];
	let currentGroup: TerminalEntryGroup = [];

	for (const entry of entries) {
		if (entry.type === "input") {
			if (currentGroup.length > 0) {
				groups.push(currentGroup);
			}
			currentGroup = [entry];
			continue;
		}

		currentGroup.push(entry);
	}

	if (currentGroup.length > 0) {
		groups.push(currentGroup);
	}

	return groups;
}

function getOutputLines(entry: TerminalEntry): Array<TerminalOutputLine> {
	return entry.content.split("\n").map((content, lineIndex) => ({
		content,
		id: `${entry.id}:line-${lineIndex}`,
	}));
}

export function TerminalOutput({ entries }: { entries: ReadonlyArray<TerminalEntry> }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const groups = useMemo(() => groupEntries(entries), [entries]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
	});

	return (
		<div className="flex-1 overflow-y-auto p-3 text-xs flex flex-col gap-4" ref={containerRef}>
			{groups.map((group) => (
				<div className="flex flex-col gap-1" key={group[0].id}>
					{group.map((entry) =>
						entry.type === "input" ? (
							<div className="flex items-center gap-2 text-muted-foreground" key={entry.id}>
								<span className="text-primary">$</span>
								<span>{entry.content}</span>
							</div>
						) : (
							<div className="text-foreground/80" key={entry.id}>
								{getOutputLines(entry).map((line) => (
									<div key={line.id}>{line.content}</div>
								))}
							</div>
						),
					)}
				</div>
			))}
		</div>
	);
}
