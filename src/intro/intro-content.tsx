import { createTimeline } from "animejs";
import { type ReactNode, useEffect, useRef } from "react";

export const INTRO_LINES = [
	"KIRDES_OS v1.0.0 -- booting...",
	"Loading design_systems.pkg",
	"Loading mcp_connectors.pkg",
	"Loading react_frontend.pkg",
	"Loading tanstack_router.pkg",
	"Mounting /projects/melo",
	"Mounting /projects/ai_agent_ux",
	"Mounting /projects/consumer_pivots",
	"Mounting /projects/paguro",
	"Checking open_to_work status",
	"Launching nvim .",
	"NVIM v0.11.0",
	"Opening workspace",
] as const;

type IntroLine = {
	text: string;
	status?: string;
	tone?: "ok" | "live" | "warning" | "muted" | "true";
	loader?: boolean;
};

const introLines: ReadonlyArray<IntroLine> = [
	{ text: "KIRDES_OS v1.0.0 -- booting..." },
	{ text: "Loading design_systems.pkg", status: "OK", tone: "ok" },
	{ text: "Loading mcp_connectors.pkg", status: "OK", tone: "ok" },
	{ text: "Loading react_frontend.pkg", status: "OK", tone: "ok" },
	{ text: "Loading tanstack_router.pkg", status: "OK", tone: "ok" },
	{ text: "Mounting /projects/melo", status: "LIVE", tone: "live" },
	{ text: "Mounting /projects/ai_agent_ux", status: "UNRELEASED", tone: "warning" },
	{ text: "Mounting /projects/consumer_pivots", status: "ARCHIVED", tone: "muted" },
	{ text: "Mounting /projects/paguro", status: "WIP", tone: "warning" },
	{ text: "Checking open_to_work status", status: "TRUE", tone: "true" },
	{ text: "Launching nvim ." },
	{ text: "NVIM v0.11.0" },
	{ text: "Opening workspace", loader: true },
];

function statusClassName(tone: IntroLine["tone"]): string {
	switch (tone) {
		case "ok":
		case "live":
		case "true":
			return "text-primary";
		case "warning":
			return "text-orange-400";
		case "muted":
			return "text-muted-foreground/70";
		default:
			return "text-muted-foreground";
	}
}

// ─── Thinking loader (animejs-driven wave of tinted blocks) ─────────

const BLOCK_COUNT = 6;

const BLOCKS: ReadonlyArray<{ id: number }> = [
	{ id: 0 },
	{ id: 1 },
	{ id: 2 },
	{ id: 3 },
	{ id: 4 },
	{ id: 5 },
];

function ThinkingLoader() {
	const blockRefs = useRef<Array<HTMLSpanElement | null>>([]);

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		const steps = 12;
		const max = BLOCK_COUNT - 1;
		const renderPeak = (peak: number) => {
			for (const block of BLOCKS) {
				const node = blockRefs.current[block.id];
				if (!node) continue;

				const dist = Math.abs(block.id - peak);
				node.style.opacity = String(1 - Math.min(dist / max, 1) * 0.7);
			}
		};

		renderPeak(0);

		const tl = createTimeline({ loop: true });

		for (let i = 0; i <= steps; i++) {
			const pos = (i / steps) * max;
			tl.call(() => renderPeak(pos), i * 60);
		}
		for (let i = 1; i <= steps; i++) {
			const pos = max - (i / steps) * max;
			tl.call(() => renderPeak(pos), (steps + i) * 60);
		}

		return () => {
			tl.revert();
		};
	}, []);

	return (
		<span aria-hidden="true" className="inline-flex align-middle">
			{BLOCKS.map((b) => (
				<span
					className="inline-block size-[1ch] bg-primary"
					key={b.id}
					ref={(node) => {
						blockRefs.current[b.id] = node;
					}}
					style={{ opacity: b.id === 0 ? 1 : 0.3 }}
				/>
			))}
		</span>
	);
}

export function IntroTranscript({ skipAnimation }: { skipAnimation?: boolean }): ReactNode {
	return (
		<div className="flex flex-col gap-1 text-muted-foreground text-xs leading-4">
			{introLines.map((line, idx) => (
				<p
					className="whitespace-pre-wrap"
					data-intro-line={idx}
					key={`${line.text}-${line.status ?? ""}`}
					style={{ opacity: skipAnimation ? 1 : 0 }}
				>
					<span>{line.text}</span>
					{line.status ? (
						<span className={`ms-2 ${statusClassName(line.tone)}`}>[{line.status}]</span>
					) : null}
					{line.loader ? (
						<span className="ms-2">
							<ThinkingLoader />
						</span>
					) : null}
				</p>
			))}
		</div>
	);
}
