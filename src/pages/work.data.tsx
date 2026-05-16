import type { ReactNode } from "react";

export type ProjectStatus = "active" | "wip" | "archived";

export type Project = {
	name: string;
	version: string;
	status: ProjectStatus;
	description: string;
	detail?: ReactNode;
};

export const projects: Array<Project> = [
	{
		name: "kish",
		version: "v1.0.0",
		status: "active",
		description: "terminal shell & command system for the portfolio",
		detail: (
			<div className="flex flex-col gap-2">
				<p>
					kish is the custom shell powering this portfolio's terminal. it handles command parsing,
					history, tab-completion, and renders output directly in the browser.
				</p>
				<p className="text-muted-foreground">
					built with TypeScript, React, and TanStack Router. commands are registered as modules —{" "}
					<span className="text-primary">cat</span>, <span className="text-primary">cd</span>,{" "}
					<span className="text-primary">open</span>, and more.
				</p>
			</div>
		),
	},
	{
		name: "kirdes.dev",
		version: "v2.0.0",
		status: "active",
		description: "this portfolio — terminal-themed, built with TanStack Start",
		detail: (
			<div className="flex flex-col gap-2">
				<p>
					A terminal-themed portfolio built with TanStack Start, React, and TypeScript. Features a
					fully interactive shell, inline code editor, music player, and a tetris game.
				</p>
				<p className="text-muted-foreground">
					design philosophy: every interaction should feel like working in a real terminal — fast,
					keyboard-driven, and distraction-free.
				</p>
			</div>
		),
	},
	{
		name: "tetris",
		version: "v0.1.0",
		status: "wip",
		description: "classic tetris implemented in the browser",
		detail: (
			<div className="flex flex-col gap-2">
				<p>
					A from-scratch implementation of classic Tetris rendered in the browser. Built as a lab
					experiment to explore game loops, collision detection, and canvas rendering.
				</p>
				<p className="text-muted-foreground">
					playable at <span className="text-primary">/lab/tetris</span>. pieces, scoring, and levels
					are all implemented from scratch.
				</p>
			</div>
		),
	},
	{
		name: "intent",
		version: "v0.0.1",
		status: "wip",
		description: "context-aware skill loading for AI coding agents",
		detail: (
			<div className="flex flex-col gap-2">
				<p>
					A CLI tool that reads your project and loads the right skills into your AI coding agent's
					context automatically. No more manual skill selection.
				</p>
				<p className="text-muted-foreground">
					built with TypeScript, powered by the pi coding agent SDK. thinking about open-sourcing it
					soon.
				</p>
			</div>
		),
	},
	{
		name: "pixi-pen",
		version: "v0.2.0",
		status: "archived",
		description: "pixel-art editor built with PixiJS v8",
		detail: (
			<div className="flex flex-col gap-2">
				<p>
					A browser-based pixel-art editor using PixiJS v8 for hardware-accelerated rendering.
					Supports layers, undo/redo, palettes, and export to PNG.
				</p>
				<p className="text-muted-foreground">
					archived in favor of more focused creative tools. the PixiJS integration patterns live on
					in other projects.
				</p>
			</div>
		),
	},
];

export const statusColors: Record<ProjectStatus, string> = {
	active: "text-green-500",
	wip: "text-yellow-500",
	archived: "text-muted-foreground",
};
