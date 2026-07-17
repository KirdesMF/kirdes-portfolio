import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/design-system/dialog";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHandle,
	DrawerPopup,
	DrawerTitle,
} from "#/design-system/drawer";
import { Kbd } from "#/design-system/kbd";
import { useIsMobile } from "#/design-system/use-media-query";
import { CloseIcon } from "#/icons/close";

type HelpDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const keybindingGroups = [
	{
		label: "Normal mode",
		rows: [
			{ keys: "?", desc: "Open help" },
			{ keys: "Space", desc: "Open leader menu" },
			{ keys: ":", desc: "Enter command-line mode" },
			{ keys: "i", desc: "Toggle status" },
			{ keys: "t", desc: "Cycle theme" },
		],
	},
	{
		label: "Navigation",
		rows: [
			{ keys: "h", desc: "Open Home" },
			{ keys: "a", desc: "Open About" },
			{ keys: "w", desc: "Open Works" },
			{ keys: "l", desc: "Open Lab" },
		],
	},
	{
		label: "Leader mappings",
		rows: [
			{ keys: "Space l", desc: "Toggle language" },
			{ keys: "s", desc: "Open settings" },
		],
	},
	{
		label: "General",
		rows: [{ keys: "Shift+R", desc: "Replay intro" }],
	},
];

export function HelpDialog(props: HelpDialogProps) {
	const isMobile = useIsMobile();
	if (isMobile) {
		return (
			<Drawer open={props.open} onOpenChange={props.onOpenChange}>
				<DrawerPopup className="px-3 pb-3">
					<DrawerHandle />
					<DrawerContent>
						<HelpDialogInner
							Close={DrawerClose}
							Description={DrawerDescription}
							Title={DrawerTitle}
						/>
					</DrawerContent>
				</DrawerPopup>
			</Drawer>
		);
	}

	return (
		<Dialog open={props.open} onOpenChange={props.onOpenChange}>
			<DialogContent className="flex">
				<HelpDialogInner Close={DialogClose} Description={DialogDescription} Title={DialogTitle} />
			</DialogContent>
		</Dialog>
	);
}

function HelpDialogInner(props: {
	Close: typeof DialogClose | typeof DrawerClose;
	Description: typeof DialogDescription | typeof DrawerDescription;
	Title: typeof DialogTitle | typeof DrawerTitle;
}) {
	const { Close, Description, Title } = props;

	return (
		<div className="relative flex min-h-0 flex-1 flex-col border-thin border-border bg-popover p-4 text-popover-foreground">
			<Title className="absolute top-0 inset-s-1/2 -translate-1/2 bg-popover px-2 leading-none text-primary border-x-thin border-border z-raised">
				:help keymaps
			</Title>
			<Close
				aria-label="Close dialog"
				className="absolute top-0 end-3 z-raised -translate-y-1/2 bg-popover px-1 text-primary leading-none focus:text-accent-foreground focus:outline-none"
			>
				<span aria-hidden="true" className="flex items-center">
					[<CloseIcon className="size-3" />]
				</span>
			</Close>

			<div className="min-h-0 flex-1 grid gap-5 overflow-y-auto touch-auto py-3">
				<Description className="border-b border-border pb-3">
					Normal-mode mappings for this portfolio. Use <Kbd className="text-xs">Space</Kbd> as the
					leader key and <Kbd className="text-xs">Esc</Kbd> to close floating windows.
				</Description>

				{keybindingGroups.map((group) => (
					<section className="grid gap-2" key={group.label}>
						<h2 className="font-medium text-xs tracking-wider uppercase text-muted-foreground">
							{group.label}
						</h2>
						<div className="grid gap-1">
							{group.rows.map((row) => (
								<div
									className="flex items-center justify-between border-thin border-border px-3 py-1.5"
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
				<Kbd className="text-tiny">Esc</Kbd> close · <Kbd className="text-tiny">?</Kbd> reopen help
			</div>
		</div>
	);
}
