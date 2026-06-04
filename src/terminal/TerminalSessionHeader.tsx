import { useRouterState } from "@tanstack/react-router";
import { animate, createScope } from "animejs";
import { useEffect, useId, useRef, useState } from "react";
import { useScrambleRef } from "#/design-system/useScrambleRef";
import { formatTerminalCwd } from "#/terminal/terminal-path";

export function TerminalSessionHeader() {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const cwd = formatTerminalCwd(pathname, { trailingSlash: true });
	const startTimeRef = useRef(Date.now());
	const [uptime, setUptime] = useState(0);
	const bootTimeId = useId();
	const bootTimeRef = useRef(getRoundedFakeNumber(bootTimeId));
	const rootRef = useScrambleRef<HTMLDivElement>({ selector: "[data-anim-header]", staggerMs: 75 });
	const statusShineRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const interval = setInterval(() => {
			setUptime(Math.floor((Date.now() - startTimeRef.current) / 1000));
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		const el = statusShineRef.current;
		if (!el) return;

		const scope = createScope({
			mediaQueries: {
				reduceMotion: "(prefers-reduced-motion)",
			},
		}).add((self) => {
			const reduceMotion = self?.matches.reduceMotion ?? false;

			animate(el, {
				backgroundPosition: ["200%", "-200%"],
				duration: reduceMotion ? 0 : 4000,
				ease: "linear",
				loop: true,
			});
		});

		return () => {
			scope.revert();
		};
	}, []);

	return (
		<div
			ref={rootRef}
			className="flex shrink-0 flex-col gap-0.5 border-b border-border px-4 py-2 font-mono text-xs text-muted-foreground"
		>
			<div className="flex items-center justify-between">
				<span>
					SESSION:{" "}
					<span data-anim-header className="text-primary">
						{formatUptime(uptime)}
					</span>
				</span>
				<span>
					VERSION:{" "}
					<span data-anim-header className="text-primary">
						kish v1.0.0
					</span>
				</span>
			</div>
			<div className="flex items-center justify-between">
				<span>
					BOOT_TIME:{" "}
					<span data-anim-header className="text-primary">
						{bootTimeRef.current} ms
					</span>
				</span>
				<span>
					HOST:{" "}
					<span data-anim-header className="text-primary">
						kirdes.dev
					</span>
				</span>
			</div>
			<div className="flex items-center justify-between">
				<span className="inline-flex items-baseline gap-1">
					STATUS:
					<span
						className="inline-block bg-linear-to-r from-status-open from-35% via-status-shimmer via-60% to-status-open to-55% bg-size-[200%_100%] bg-clip-text leading-none text-transparent"
						ref={statusShineRef}
					>
						AVAILABLE
					</span>
				</span>
				<span>
					CWD:{" "}
					<span data-anim-header className="text-primary">
						{cwd}
					</span>
				</span>
			</div>
		</div>
	);
}

function getHashValue(seed: string): number {
	let hash = 0;

	for (const character of seed) {
		hash = (hash * 31 + character.charCodeAt(0)) % 100000;
	}

	return hash;
}

function getRoundedFakeNumber(seed: string): number {
	const min = 100;
	const max = 500;
	const range = max - min + 1;
	const hash = getHashValue(seed);

	return min + (hash % range);
}

function formatUptime(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
