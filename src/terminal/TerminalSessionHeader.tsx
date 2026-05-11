import { useRouterState } from "@tanstack/react-router";
import { animate, stagger } from "animejs";
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
const bootTimeMs = Math.round(Math.random() * 500);

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

	useEffect(() => {
		const anim = animate("[data-anim-header]", {
			ease: "linear",
			innerHTML: scrambleText({
				cursor: "░▒▓█",
				delay: stagger(100),
			}),
		});

		return () => {
			anim.revert();
		};
	}, []);

	return (
		<div className="flex shrink-0 flex-col gap-0.5 border-b border-border px-4 py-2 font-mono text-xs text-muted-foreground">
			<div className="flex items-center">
				<span>
					SESSION:{" "}
					<span data-anim-header className="text-primary">
						{formatUptime(uptime)}
					</span>
				</span>
				<span className="ms-auto">
					VERSION:{" "}
					<span data-anim-header className="text-primary">
						kish v1.0.0
					</span>
				</span>
			</div>
			<div className="flex items-center">
				<span>
					BOOT_TIME:{" "}
					<span data-anim-header className="text-primary">
						{bootTimeMs} ms
					</span>
				</span>
				<span className="ms-auto">
					HOST:{" "}
					<span data-anim-header className="text-primary">
						kirdes.dev
					</span>
				</span>
			</div>
			<div className="flex items-center">
				<span>
					STATUS:{" "}
					<span data-anim-header className="text-green-500">
						OK
					</span>
				</span>
				<span className="ms-auto">
					CWD:{" "}
					<span data-anim-header className="text-primary">
						{cwd}
					</span>
				</span>
			</div>
		</div>
	);
}
