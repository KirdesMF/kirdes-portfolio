import { ChevronRightIcon, CircleHelpIcon, FolderIcon, TerminalIcon } from "lucide-react";
import { cn } from "#/design-system/cn";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "#/design-system/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHandle,
	DrawerTitle,
} from "#/design-system/drawer";
import { useIsMobile } from "#/design-system/useMediaQuery";
import { m } from "#/paraglide/messages";
import { terminalCommands } from "#/terminal/terminal-commands";
import { terminalRoutes } from "#/terminal/terminal-routes";

const routeDescriptionMessages: Record<string, () => string> = {
	"/home": () => m.route_home(),
	"/about": () => m.route_about(),
	"/work": () => m.route_work(),
	"/contact": () => m.route_contact(),
};

const commandDescriptionMessages: Record<string, () => string> = {
	bun: () => m.cmd_bun(),
	cat: () => m.cmd_cat(),
	cd: () => m.cmd_cd(),
	clear: () => m.cmd_clear(),
	config: () => m.cmd_config(),
	close: () => m.cmd_close(),
	date: () => m.cmd_date(),
	email: () => m.cmd_email(),
	git: () => m.cmd_git(),
	github: () => m.cmd_github(),
	lang: () => m.cmd_lang(),
	linkedin: () => m.cmd_linkedin(),
	social: () => m.cmd_social(),
	x: () => m.cmd_x(),
	help: () => m.cmd_help(),
	history: () => m.cmd_history(),
	ls: () => m.cmd_ls(),
	man: () => m.cmd_man(),
	nvim: () => m.cmd_nvim(),
	open: () => m.cmd_open(),
	pwd: () => m.cmd_pwd(),
	reload: () => m.cmd_reload(),
	rm: () => m.cmd_rm(),
	settings: () => m.cmd_settings(),
	source: () => m.cmd_source(),
	tree: () => m.cmd_tree(),
	whoami: () => m.cmd_whoami(),
};

type HelpDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

function getShortcut(value: string, used: Set<string>): string {
	for (const character of value.replace(/^\//, "")) {
		if (!/[a-z0-9]/i.test(character)) continue;
		const shortcut = character.toLowerCase();
		if (used.has(shortcut)) continue;
		used.add(shortcut);
		return shortcut;
	}

	return "•";
}

export function HelpDialog(props: HelpDialogProps) {
	const isMobile = useIsMobile();

	if (isMobile) {
		return (
			<Drawer open={props.open} onOpenChange={props.onOpenChange}>
				<DrawerContent className="px-3 pb-3">
					<DrawerHandle />
					<HelpDialogInner Description={DrawerDescription} Title={DrawerTitle} />
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Dialog open={props.open} onOpenChange={props.onOpenChange}>
			<DialogContent className="flex">
				<HelpDialogInner Description={DialogDescription} Title={DialogTitle} />
			</DialogContent>
		</Dialog>
	);
}

function HelpDialogInner(props: {
	Description: typeof DialogDescription | typeof DrawerDescription;
	Title: typeof DialogTitle | typeof DrawerTitle;
}) {
	const usedShortcuts = new Set<string>();
	const { Description, Title } = props;

	return (
		<div className="relative flex min-h-0 flex-1 flex-col rounded border-2 border-border bg-popover p-4 text-popover-foreground">
			<Title className="absolute top-0 inset-s-1/2 -translate-1/2 bg-popover px-2 leading-none text-primary border-x-2 border-border z-raised">
				{m.help_title()}
			</Title>

			<div className="min-h-0 flex-1 grid gap-5 overflow-y-auto touch-auto py-3">
				<Description className="border-b border-border pb-3">
					{m.help_description_prefix()} <span className="text-foreground">man &lt;command&gt;</span>{" "}
					{m.help_description_suffix()}
				</Description>

				<div className="grid gap-1 font-mono text-xs">
					{terminalRoutes.map((route) => (
						<HelpRow
							description={routeDescriptionMessages[route]?.() ?? ""}
							icon="route"
							key={route}
							label={route}
							shortcut={getShortcut(route, usedShortcuts)}
						/>
					))}
					{terminalCommands.map((command) => (
						<HelpRow
							description={commandDescriptionMessages[command]?.() ?? ""}
							icon={command === "help" ? "help" : "command"}
							key={command}
							label={command}
							shortcut={getShortcut(command, usedShortcuts)}
						/>
					))}
				</div>
			</div>

			<div className="flex items-center justify-center gap-6 border-t border-border pt-3 text-muted-foreground text-xs">
				<span>
					<kbd className="text-primary">ESC</kbd> {m.help_hint_close()}
				</span>
				<span>
					<kbd className="text-primary">←</kbd> {m.help_hint_back()}
				</span>
			</div>
		</div>
	);
}

function HelpRow(props: {
	description: string;
	icon: "command" | "help" | "route";
	label: string;
	shortcut: string;
}) {
	const Icon =
		props.icon === "route" ? FolderIcon : props.icon === "help" ? CircleHelpIcon : TerminalIcon;

	return (
		<div className="grid grid-cols-[auto_auto_auto_minmax(0,1fr)] items-center gap-2 rounded px-1 py-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
			<span className="text-right font-medium text-primary">{props.shortcut}</span>
			<ChevronRightIcon className="size-3.5 text-muted-foreground/70" />
			<Icon className={cn("size-3.5 text-primary")} />
			<span className="min-w-0 truncate">
				<span className="text-foreground">{props.label}</span>
				{props.description ? (
					<span className="text-muted-foreground"> — {props.description}</span>
				) : null}
			</span>
		</div>
	);
}
