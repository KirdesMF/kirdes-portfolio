import { BoomBox } from "lucide-react";

import { Dialog, DialogClose, DialogContent, DialogTitle } from "#/design-system/Dialog";

export function MusicDialog({ onClose }: { onClose: () => void }) {
	return (
		<Dialog
			open
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent>
				<div className="flex items-center gap-2">
					<BoomBox className="size-4" />
					<DialogTitle>music player</DialogTitle>
				</div>
				<p className="text-muted-foreground text-xs">spotify player coming soon.</p>
				<div className="mt-2 flex justify-end gap-2">
					<DialogClose
						className="rounded border border-border px-3 py-1.5 text-tiny text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
						onClick={onClose}
					>
						close
					</DialogClose>
				</div>
			</DialogContent>
		</Dialog>
	);
}
