import { useRouterState } from "@tanstack/react-router";
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
	const [uptime, setUptime] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setUptime(Math.floor((Date.now() - startTimeRef.current) / 1000));
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="flex shrink-0 flex-col gap-px border-b border-border px-3 py-1.5 font-mono text-tiny text-muted-foreground">
			<div className="flex items-center">
				<span>
					SESSION: <span className="text-primary">{formatUptime(uptime)}</span>
				</span>
				<span className="ms-auto">
					VERSION: <span className="text-primary">kish v1.0.0</span>
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
