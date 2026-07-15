import { useHotkeys } from "@tanstack/react-hotkeys";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { createScope, createTimeline } from "animejs";
import {
	FlaskConical,
	FolderKanban,
	HelpCircle,
	type LucideIcon,
	Mail,
	RotateCw,
	Settings,
	User,
	ZapIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "#/design-system/cn";
import { useScrambleRef } from "#/design-system/use-scramble-ref";
import { AsciiBanner } from "#/editor/ascii-banner/ascii-banner";
import { useIdeStore } from "#/ide/store";

const emptyEditorCommands: Array<{
	id: string;
	Icon: LucideIcon;
	label: string;
	shortcut: string;
}> = [
	{ id: "about", Icon: User, label: "About", shortcut: "a" },
	{ id: "works", Icon: FolderKanban, label: "Works", shortcut: "w" },
	{ id: "lab", Icon: FlaskConical, label: "Lab", shortcut: "l" },
	{ id: "contacts", Icon: Mail, label: "Contacts", shortcut: "c" },
	{ id: "settings", Icon: Settings, label: "Settings", shortcut: "s" },
	{ id: "reload", Icon: RotateCw, label: "Replay Intro", shortcut: "R" },
	{ id: "help", Icon: HelpCircle, label: "Help", shortcut: "?" },
];

const commandIndicatorPixels = Array.from({ length: 5 }, (_, index) => index);

function EmptyEditorCommandButton({
	Icon,
	label,
	onClick,
	shortcut,
}: {
	Icon: LucideIcon;
	label: string;
	onClick: () => void;
	shortcut: string;
}) {
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const pixelRefs = useRef<Array<HTMLSpanElement | null>>([]);

	useEffect(() => {
		const scope = createScope({
			mediaQueries: { reduceMotion: "(prefers-reduced-motion: reduce)" },
			root: buttonRef,
		}).add((self) => {
			if (self?.matches.reduceMotion) return;

			const max = commandIndicatorPixels.length - 1;
			const steps = 8;
			const renderPeak = (peak: number) => {
				for (const pixel of commandIndicatorPixels) {
					const node = pixelRefs.current[pixel];
					if (!node) continue;

					const distance = Math.abs(pixel - peak);
					node.style.opacity = String(Math.max(1 - distance * 0.62, 0.18));
				}
			};

			renderPeak(0);

			const timeline = createTimeline({ loop: true });

			for (let i = 0; i <= steps; i++) {
				const position = (i / steps) * max;
				timeline.call(() => renderPeak(position), i * 70);
			}
			for (let i = 1; i <= steps; i++) {
				const position = max - (i / steps) * max;
				timeline.call(() => renderPeak(position), (steps + i) * 70);
			}
		});

		return () => {
			scope.revert();
		};
	}, []);

	return (
		<button
			className="pointer-events-auto group relative grid grid-cols-[auto_1fr_1ch] items-center gap-4 px-2 py-1.5 text-left text-primary/90 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
			ref={buttonRef}
			type="button"
			onClick={onClick}
		>
			<span
				aria-hidden="true"
				className="absolute inset-y-0 start-0 grid w-1 grid-rows-5 gap-px opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100"
			>
				{commandIndicatorPixels.map((pixel) => (
					<span
						className="bg-primary"
						key={pixel}
						ref={(node) => {
							pixelRefs.current[pixel] = node;
						}}
						style={{ opacity: pixel === 0 ? 1 : 0.18 }}
					/>
				))}
			</span>
			<Icon aria-hidden="true" className="size-4 text-primary" />
			<span className="truncate">{label}</span>
			<span className="text-command-shortcut text-end">{shortcut}</span>
		</button>
	);
}

export function EmptyEditor() {
	const [compact, setCompact] = useState(false);
	const commandMenuOpen = useIdeStore((s) => s.commandMenuOpen);
	const settingsOpen = useIdeStore((s) => s.settingsOpen);
	const helpOpen = useIdeStore((s) => s.helpOpen);
	const setHelpOpen = useIdeStore((s) => s.setHelpOpen);
	const setSettingsOpen = useIdeStore((s) => s.setSettingsOpen);
	const navigate = useNavigate();
	const search = useRouterState({ select: (s) => s.location.search }) as {
		contact?: "open";
	};
	const contactOpen = search.contact === "open";
	const emptyEditorHotkeysBlocked = contactOpen || commandMenuOpen || helpOpen || settingsOpen;
	const containerRef = useRef<HTMLDivElement | null>(null);
	const rootRef = useScrambleRef<HTMLDivElement>({
		selector: "[data-anim-editor-status]",
		staggerMs: 0,
	});

	function toggleContact() {
		void navigate({
			to: "/home",
			search: (prev) => ({
				...prev,
				contact: search.contact === "open" ? undefined : "open",
			}),
		});
	}

	function runEmptyEditorCommand(commandId: string) {
		switch (commandId) {
			case "about":
				void navigate({ to: "/about", search: {} });
				break;
			case "works":
				void navigate({ to: "/works", search: {} });
				break;
			case "lab":
				void navigate({ to: "/lab", search: {} });
				break;
			case "settings":
				setSettingsOpen(true);
				break;
			case "contacts":
				toggleContact();
				break;
			case "help":
				setHelpOpen(true);
				break;
			case "reload":
				void navigate({ to: "/" });
				break;
		}
	}

	useHotkeys(
		[
			{ hotkey: "Shift+R", callback: () => runEmptyEditorCommand("reload") },
			{ hotkey: "C", callback: () => runEmptyEditorCommand("contacts") },
		],
		{
			enabled: !emptyEditorHotkeysBlocked,
			ignoreInputs: true,
			preventDefault: true,
		},
	);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		let frame = 0;
		const updateCompact = () => {
			const nextCompact = container.getBoundingClientRect().height < 460;
			setCompact((previous) => (previous === nextCompact ? previous : nextCompact));
		};
		const scheduleUpdate = () => {
			if (frame) return;
			frame = window.requestAnimationFrame(() => {
				frame = 0;
				updateCompact();
			});
		};
		const observer = new ResizeObserver(scheduleUpdate);
		observer.observe(container);
		updateCompact();

		return () => {
			observer.disconnect();
			if (frame) window.cancelAnimationFrame(frame);
		};
	}, []);

	return (
		<div className="flex min-h-full items-center justify-center p-6 text-xs" ref={containerRef}>
			<div
				className={cn(
					"flex w-full max-w-3xl flex-col items-center text-primary/80",
					compact ? "gap-4" : "gap-7",
				)}
			>
				<AsciiBanner
					className={cn("pointer-events-auto w-full", compact ? "max-w-sm" : "max-w-lg")}
				/>
				<div
					className={cn("pointer-events-auto grid w-full max-w-sm gap-1", compact && "grid-cols-2")}
				>
					{emptyEditorCommands.map(({ Icon, id, label, shortcut }) => (
						<EmptyEditorCommandButton
							Icon={Icon}
							key={id}
							label={label}
							shortcut={shortcut}
							onClick={() => runEmptyEditorCommand(id)}
						/>
					))}
				</div>
				<div
					className="flex items-center justify-center gap-1.5 text-primary/70 text-tiny"
					ref={rootRef}
				>
					<ZapIcon aria-hidden="true" className="size-3 text-primary" />
					<button
						className="pointer-events-auto text-primary/70 transition hover:text-primary focus:text-primary focus:outline-none"
						type="button"
						onClick={toggleContact}
					>
						<span data-anim-editor-status>open to freelance and full-time opportunities</span>
					</button>
				</div>
			</div>
		</div>
	);
}
