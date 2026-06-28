import { createTimeline } from "animejs";
import { GitBranch, MoveRight } from "lucide-react";
import { type ReactNode, useEffect, useId, useMemo, useRef } from "react";
import { getRandomNumber } from "#/utils/random-number";
import { GitOutput } from "./terminal-command-outputs";

// ─── Command list ─────────────────────────────────────────────────────

/** Commands in the order they appear. Used by the typewriter hook. */
export const INTRO_COMMANDS = [
	"git branch",
	"git switch feat/portfolio",
	"git log --oneline -3",
	"bun install",
	"nvim .",
] as const;

// ─── Static transcript entries ────────────────────────────────────────

type IntroTranscriptEntry = {
	command: string;
	branch: string;
	output: ReactNode;
};

function useTranscript(): ReadonlyArray<IntroTranscriptEntry> {
	return useMemo(
		() => [
			{
				command: "git branch",
				branch: "main",
				output: <GitBranchOutput />,
			},
			{
				command: "git switch feat/portfolio",
				branch: "main",
				output: <GitSwitchOutput />,
			},
			{
				command: "git log --oneline -3",
				branch: "feat/portfolio",
				output: <GitOutput subcommand="log" />,
			},
			{
				command: "bun install",
				branch: "feat/portfolio",
				output: <BunInstallOutput />,
			},
			{
				command: "nvim .",
				branch: "feat/portfolio",
				output: <NvimLaunchOutput />,
			},
		],
		[],
	);
}

// ─── Git branch output (intro-specific) ───────────────────────────────

function GitBranchOutput(): ReactNode {
	return (
		<div className="flex flex-col whitespace-pre-wrap font-mono">
			<p className="text-foreground/80"> feat/portfolio</p>
			<p className="text-foreground/80"> feat/ascii-title</p>
			<p className="text-primary">* main</p>
			<p className="text-foreground/80"> experiments/touch-type</p>
		</div>
	);
}

// ─── Git switch output ────────────────────────────────────────────────

function GitSwitchOutput(): ReactNode {
	return (
		<div className="flex flex-col whitespace-pre-wrap font-mono text-muted-foreground">
			<p>
				Switched to branch <span className="text-primary">&apos;feat/portfolio&apos;</span>
			</p>
		</div>
	);
}

// ─── Bun install output ───────────────────────────────────────────────

function BunInstallOutput(): ReactNode {
	const id = useId();
	const ms = getRandomNumber({ hash: id, min: 80, max: 120 });
	const pkgCount = getRandomNumber({ hash: `${id}-p`, min: 180, max: 195 });

	return (
		<div className="flex flex-col gap-0.5 whitespace-pre-wrap font-mono text-muted-foreground">
			<p>
				<span className="text-primary">bun install</span> v1.3.4
			</p>
			<p className="text-foreground/80">
				<span className="text-primary">+</span>{" "}
				<span className="text-foreground/80">@tanstack/react-router</span>
			</p>
			<p className="text-foreground/80">
				<span className="text-primary">+</span>{" "}
				<span className="text-foreground/80">@tanstack/react-start</span>
			</p>
			<p className="text-foreground/80">
				<span className="text-primary">+</span> <span className="text-foreground/80">animejs</span>
			</p>
			<p className="text-foreground/80">
				<span className="text-primary">+</span>{" "}
				<span className="text-foreground/80">lucide-react</span>
			</p>
			<p className="text-muted-foreground/50">...</p>
			<p className="mt-1">
				<span className="text-primary">{pkgCount}</span> packages installed
				<span className="text-muted-foreground/70"> in </span>
				<span className="text-foreground/80">{ms}ms</span>
			</p>
		</div>
	);
}

// ─── Nvim launch output ───────────────────────────────────────────────

function NvimLaunchOutput(): ReactNode {
	return (
		<div className="flex flex-col gap-0.5 whitespace-pre-wrap font-mono text-foreground/90">
			<p className="text-muted-foreground">Launching Neovim...</p>
			<p className="mt-1">
				<span className="text-primary"></span>{" "}
				<span className="text-foreground/80">NVIM v0.11.0</span>
			</p>
			<p className="text-muted-foreground/70">
				Opening work in editor… <ThinkingLoader />
			</p>
		</div>
	);
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

// ─── Prompt line component ────────────────────────────────────────────

function PromptLine({
	branch,
	command,
	cmdIdx,
}: {
	branch: string;
	command: string;
	cmdIdx: number;
}) {
	return (
		<div className="flex flex-col gap-1">
			<div className="text-muted-foreground">
				<span className="text-primary">~/code</span>
				<span> on </span>
				<GitBranch className="mr-0.5 inline-block size-3 align-middle text-muted-foreground/70" />
				<span className="text-foreground" data-intro-branch={branch}>
					{branch}
				</span>
			</div>
			<div className="flex items-center gap-2 text-muted-foreground">
				<MoveRight className="size-3.5 shrink-0" />
				{/* biome-ignore format: keep inline to avoid whitespace text nodes */}
				<span className="text-foreground" data-intro-cmd={cmdIdx}>{command}</span>
			</div>
		</div>
	);
}

// ─── Full static transcript ───────────────────────────────────────────

export function IntroTranscript({ skipAnimation }: { skipAnimation?: boolean }): ReactNode {
	const entries = useTranscript();

	return (
		<div className="flex flex-col gap-4" data-intro-root>
			{entries.map((entry, idx) => (
				<div
					className="flex flex-col gap-1"
					data-intro-entry={idx}
					key={entry.command}
					style={{ opacity: skipAnimation ? 1 : 0 }}
				>
					<PromptLine branch={entry.branch} command={entry.command} cmdIdx={idx} />
					<div
						className="text-foreground/90"
						data-intro-out={idx}
						style={{ opacity: skipAnimation ? 1 : 0 }}
					>
						{entry.output}
					</div>
				</div>
			))}
		</div>
	);
}
