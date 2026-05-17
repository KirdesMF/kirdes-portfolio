import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useScrambleRef } from "#/design-system/useScrambleRef";

export function TerminalSessionHeader() {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const cwd = formatCwd(pathname);
	const startTimeRef = useRef(Date.now());
	const [uptime, setUptime] = useState(0);
	const rootRef = useScrambleRef<HTMLDivElement>({ selector: "[data-anim-header]", staggerMs: 75 });

	useEffect(() => {
		const interval = setInterval(() => {
			setUptime(Math.floor((Date.now() - startTimeRef.current) / 1000));
		}, 1000);

		return () => clearInterval(interval);
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
						{getRoundedFakeNumber("boot-time")} ms
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
				<span>
					STATUS:{" "}
					<span data-anim-header className="text-green-500">
						OK
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

function formatCwd(pathname: string): string {
	if (pathname === "/terminal") return "~/";
	if (!pathname.startsWith("/terminal/")) return "~/";

	return `~/${pathname.replace("/terminal/", "")}`;
}

function formatUptime(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
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
