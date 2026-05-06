import { Popover as BasePopover } from "@base-ui/react/popover";
import type { ReactElement, ReactNode } from "react";

import { cn } from "#/design-system/cn";

type PopoverProps = {
	children: ReactElement;
	content: ReactNode;
};

export function Popover({ children, content }: PopoverProps): ReactNode {
	return (
		<BasePopover.Root>
			<BasePopover.Trigger render={children} />
			<BasePopover.Portal>
				<BasePopover.Positioner side="top" sideOffset={8}>
					<BasePopover.Popup
						className={cn(
							"w-64 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-md",
							"data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:translate-y-1 data-starting-style:translate-y-1",
							"transition-[opacity,transform] duration-150 ease-editor-shell motion-reduce:transition-none",
						)}
						initialFocus={false}
					>
						{content}
					</BasePopover.Popup>
				</BasePopover.Positioner>
			</BasePopover.Portal>
		</BasePopover.Root>
	);
}
