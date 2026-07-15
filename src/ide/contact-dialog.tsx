import { useNavigate, useRouterState } from "@tanstack/react-router";
import { contactInfo } from "#/data";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "#/design-system/dialog";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerHandle,
	DrawerPopup,
	DrawerTitle,
} from "#/design-system/drawer";
import { useIsMobile } from "#/design-system/use-media-query";

export function ContactDialog() {
	const isMobile = useIsMobile();
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const search = useRouterState({ select: (s) => s.location.search }) as {
		contact?: "open";
	};
	const open = search.contact === "open";

	function handleOpenChange(nextOpen: boolean) {
		void navigate({
			to: pathname,
			search: (prev) => ({ ...prev, contact: nextOpen ? "open" : undefined }),
		});
	}

	if (isMobile) {
		return (
			<Drawer open={open} onOpenChange={handleOpenChange}>
				<DrawerPopup className="px-3 pb-3">
					<DrawerHandle />
					<DrawerContent>
						<ContactDialogInner Close={DrawerClose} Title={DrawerTitle} />
					</DrawerContent>
				</DrawerPopup>
			</Drawer>
		);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="flex">
				<ContactDialogInner Close={DialogClose} Title={DialogTitle} />
			</DialogContent>
		</Dialog>
	);
}

function ContactDialogInner(props: {
	Close: typeof DialogClose | typeof DrawerClose;
	Title: typeof DialogTitle | typeof DrawerTitle;
}) {
	const { Close, Title } = props;

	return (
		<div className="relative flex min-h-0 flex-1 flex-col border-thin border-border bg-popover p-4 text-popover-foreground">
			<Title className="absolute top-0 inset-s-1/2 -translate-1/2 bg-popover px-2 leading-none text-primary border-x-thin border-border z-raised">
				CONTACT
			</Title>
			<Close
				aria-label="Close contact dialog"
				className="absolute top-0 end-3 z-raised -translate-y-1/2 bg-popover px-1 text-primary leading-none focus:text-accent-foreground focus:outline-none"
			>
				[X]
			</Close>

			<div className="grid gap-2 text-muted-foreground text-tiny leading-5">
				<a
					className="text-foreground underline-offset-4 hover:underline"
					href={`mailto:${contactInfo.email}`}
				>
					{contactInfo.email}
				</a>
				<a
					className="text-foreground underline-offset-4 hover:underline"
					href={contactInfo.linkedin.url}
					rel="noreferrer"
					target="_blank"
				>
					LinkedIn / {contactInfo.linkedin.handle} ↗
				</a>
				<a
					className="text-foreground underline-offset-4 hover:underline"
					href={contactInfo.github.url}
					rel="noreferrer"
					target="_blank"
				>
					GitHub / {contactInfo.github.handle} ↗
				</a>
				<a
					className="text-foreground underline-offset-4 hover:underline"
					href={contactInfo.x.url}
					rel="noreferrer"
					target="_blank"
				>
					X / {contactInfo.x.handle} ↗
				</a>
			</div>
		</div>
	);
}
