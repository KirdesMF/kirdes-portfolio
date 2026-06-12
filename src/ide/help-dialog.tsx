import { Dialog, DialogContent, DialogDescription, DialogTitle } from "#/design-system/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHandle,
	DrawerTitle,
} from "#/design-system/drawer";
import { Kbd } from "#/design-system/kbd";
import { useIsMobile } from "#/design-system/use-media-query";

type HelpDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const keybindingGroups = [
	{
		label: "Global",
		rows: [
			{ keys: "h", desc: "Help" },
			{ keys: "Space", desc: "Command menu" },
			{ keys: ":", desc: "Command mode" },
			{ keys: "f", desc: "Find file" },
			{ keys: "g", desc: "Find text" },
			{ keys: "r", desc: "Recent files" },
		],
	},
	{
		label: "Navigation",
		rows: [
			{ keys: "Space p", desc: "Projects" },
			{ keys: "Space o", desc: "Open Preview" },
			{ keys: "Space y", desc: "Copy Link" },
			{ keys: "Space T", desc: "Theme Mode" },
			{ keys: "c", desc: "Settings" },
			{ keys: "m", desc: "Email" },
			{ keys: "s", desc: "Social medias" },
		],
	},
	{
		label: "Editor",
		rows: [
			{ keys: "Space q", desc: "Close file / quit" },
			{ keys: "Shift+R", desc: "Reload" },
		],
	},
];

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
	const { Description, Title } = props;

	return (
		<div className="relative flex min-h-0 flex-1 flex-col rounded border-2 border-border bg-popover p-4 text-popover-foreground">
			<Title className="absolute top-0 inset-s-1/2 -translate-1/2 bg-popover px-2 leading-none text-primary border-x-2 border-border z-raised">
				Keyboard Shortcuts
			</Title>

			<div className="min-h-0 flex-1 grid gap-5 overflow-y-auto touch-auto py-3">
				<Description className="border-b border-border pb-3">
					Press the keys below to trigger actions. Close this dialog with{" "}
					<Kbd className="text-xs">Esc</Kbd>.
				</Description>

				{keybindingGroups.map((group) => (
					<section className="grid gap-2" key={group.label}>
						<h2 className="font-medium text-xs tracking-wider uppercase text-muted-foreground">
							{group.label}
						</h2>
						<div className="grid gap-1">
							{group.rows.map((row) => (
								<div
									className="flex items-center justify-between rounded border border-border px-3 py-1.5"
									key={row.keys}
								>
									<span className="text-xs">{row.desc}</span>
									<Kbd className="text-xs">{row.keys}</Kbd>
								</div>
							))}
						</div>
					</section>
				))}
			</div>

			<div className="border-t border-border pt-3 text-center text-tiny text-muted-foreground">
				<Kbd className="text-tiny">Esc</Kbd> close
			</div>
		</div>
	);
}
