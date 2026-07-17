import { useHotkeySequence, useHotkeys } from "@tanstack/react-hotkeys";
import { useNavigate } from "@tanstack/react-router";
import { createScope, createTimeline } from "animejs";
import { useEffect, useRef, useState } from "react";
import { AsciiBanner } from "#/components/ascii-banner/ascii-banner";
import { contactInfo } from "#/data";
import { cn } from "#/design-system/cn";
import { useScrambleRef } from "#/design-system/use-scramble-ref";
import { BriefcaseIcon } from "#/icons/briefcase";
import { EmailIcon } from "#/icons/email";
import { GitHubIcon } from "#/icons/github";
import { HelpCircleIcon } from "#/icons/help-circle";
import type { IconComponent } from "#/icons/icon.types";
import { RotateCwIcon } from "#/icons/rotate-cw";
import { SettingsIcon } from "#/icons/settings";
import { TestTubeIcon } from "#/icons/test-tube";
import { UserIcon } from "#/icons/user";
import { ZapIcon } from "#/icons/zap";
import { useAppStore } from "#/store";

const homePageCommands: Array<{
	id: string;
	Icon: IconComponent;
	label: string;
	shortcut: string;
}> = [
	{ id: "about", Icon: UserIcon, label: "About", shortcut: "a" },
	{ id: "works", Icon: BriefcaseIcon, label: "Works", shortcut: "w" },
	{ id: "lab", Icon: TestTubeIcon, label: "Lab", shortcut: "l" },
	{ id: "github", Icon: GitHubIcon, label: "GitHub", shortcut: "gh" },
	{ id: "email", Icon: EmailIcon, label: "Email", shortcut: "cm" },
	{ id: "settings", Icon: SettingsIcon, label: "Settings", shortcut: "s" },
	{ id: "reload", Icon: RotateCwIcon, label: "Reload", shortcut: "R" },
	{ id: "help", Icon: HelpCircleIcon, label: "Help", shortcut: "?" },
];

const commandIndicatorPixels = Array.from({ length: 5 }, (_, index) => index);

function HomePageCommandButton({
	Icon,
	label,
	onClick,
	shortcut,
}: {
	Icon: IconComponent;
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
			className="pointer-events-auto group relative grid grid-cols-[auto_1fr_2ch] items-center gap-4 px-2 py-1.5 text-left text-primary hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
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
			<span className="truncate font-medium">{label}</span>
			<span className="text-command-shortcut group-hover:text-accent-foreground group-focus:text-accent-foreground font-medium text-end">
				{shortcut}
			</span>
		</button>
	);
}

export function HomePage() {
	const [compact, setCompact] = useState(false);
	const commandMenuOpen = useAppStore((s) => s.commandMenuOpen);
	const settingsOpen = useAppStore((s) => s.settingsOpen);
	const helpOpen = useAppStore((s) => s.helpOpen);
	const setHelpOpen = useAppStore((s) => s.setHelpOpen);
	const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
	const navigate = useNavigate();
	const homePageHotkeysBlocked = commandMenuOpen || helpOpen || settingsOpen;
	const containerRef = useRef<HTMLDivElement | null>(null);
	const rootRef = useScrambleRef<HTMLDivElement>({
		selector: "[data-anim-home-status]",
		staggerMs: 0,
	});

	function runHomePageCommand(commandId: string) {
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
			case "github":
				window.open(contactInfo.github.url, "_blank", "noopener,noreferrer");
				break;
			case "email":
				window.location.href = `mailto:${contactInfo.email}`;
				break;
			case "settings":
				setSettingsOpen(true);
				break;
			case "help":
				setHelpOpen(true);
				break;
			case "reload":
				void navigate({ to: "/" });
				break;
		}
	}

	useHotkeys([{ hotkey: "Shift+R", callback: () => runHomePageCommand("reload") }], {
		enabled: !homePageHotkeysBlocked,
		ignoreInputs: true,
		preventDefault: true,
	});
	useHotkeySequence(["G", "H"], () => runHomePageCommand("github"), {
		enabled: !homePageHotkeysBlocked,
		ignoreInputs: true,
		preventDefault: true,
	});
	useHotkeySequence(["C", "M"], () => runHomePageCommand("email"), {
		enabled: !homePageHotkeysBlocked,
		ignoreInputs: true,
		preventDefault: true,
	});

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
					{homePageCommands.map(({ Icon, id, label, shortcut }) => (
						<HomePageCommandButton
							Icon={Icon}
							key={id}
							label={label}
							shortcut={shortcut}
							onClick={() => runHomePageCommand(id)}
						/>
					))}
				</div>
				<div
					className="flex items-center justify-center gap-1.5 text-primary/70 text-tiny"
					ref={rootRef}
				>
					<ZapIcon aria-hidden="true" className="size-3 text-primary" />
					<span data-anim-home-status className="font-medium">
						open to freelance and full-time opportunities
					</span>
				</div>
			</div>
		</div>
	);
}
