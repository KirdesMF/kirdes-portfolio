import { useRouterState } from "@tanstack/react-router";
import { animate } from "animejs";
import { scrambleText } from "animejs/text";
import { useEffect, useRef, useState } from "react";

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

// Capture boot time at module level — clamp to 500ms max
const bootTimeMs = Math.min(Math.round(performance.now()), 500);

export function TerminalSessionHeader() {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const cwd = formatCwd(pathname);
	const startTimeRef = useRef(Date.now());
	const versionRef = useRef<HTMLSpanElement>(null);
	const [uptime, setUptime] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setUptime(Math.floor((Date.now() - startTimeRef.current) / 1000));
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		const el = versionRef.current;
		if (!el) return;

		const anim = animate(el, {
			duration: 2000,
			ease: "linear",
			modifier: scrambleText({
				text: "kish v1.0.0",
				chars: "░▒▓█",
				cursor: "░▒▓█",
				revealRate: 60,
				settleDuration: 500,
			}) as unknown as (value: number) => string,
		});

		return () => {
			anim.revert();
		};
	}, []);

	return (
		<div className="flex shrink-0 flex-col gap-0.5 border-b border-border px-4 py-2 font-mono text-xs text-muted-foreground">
			<div className="flex items-center">
				<span>
					SESSION: <span className="text-primary">{formatUptime(uptime)}</span>
				</span>
				<span className="ms-auto">
					VERSION: <span ref={versionRef} className="text-primary" />
				</span>
			</div>
			<div className="flex items-center">
				<span>
					BOOT: <span className="text-primary">{bootTimeMs}ms</span>
				</span>
				<span className="ms-auto">
					HOST: <span className="text-primary">kirdes.dev</span>
				</span>
			</div>
			<div className="flex items-center">
				<span>
					STATUS: <span className="text-green-500">200</span>
				</span>
				<span className="ms-auto">
					CWD: <span className="text-primary">{cwd}</span>
				</span>
			</div>
		</div>
	);
}
