import { Popover as BasePopover } from "@base-ui/react/popover";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "#/design-system/cn";

type PopoverProps = ComponentProps<typeof BasePopover.Root>;
type PopoverTriggerProps = ComponentProps<typeof BasePopover.Trigger>;
type PopoverContentProps = Omit<ComponentProps<typeof BasePopover.Popup>, "className"> & {
	align?: ComponentProps<typeof BasePopover.Positioner>["align"];
	className?: string;
	side?: ComponentProps<typeof BasePopover.Positioner>["side"];
	sideOffset?: ComponentProps<typeof BasePopover.Positioner>["sideOffset"];
};
type PopoverTitleProps = Omit<ComponentProps<typeof BasePopover.Title>, "className"> & {
	className?: string;
};
type PopoverDescriptionProps = Omit<ComponentProps<typeof BasePopover.Description>, "className"> & {
	className?: string;
};

export function Popover(props: PopoverProps): ReactNode {
	return <BasePopover.Root {...props} />;
}

export function PopoverTrigger(props: PopoverTriggerProps): ReactNode {
	return <BasePopover.Trigger {...props} />;
}

export function PopoverContent({
	align,
	children,
	className,
	side = "top",
	sideOffset = 8,
	...props
}: PopoverContentProps): ReactNode {
	return (
		<BasePopover.Portal>
			<BasePopover.Positioner align={align} side={side} sideOffset={sideOffset}>
				<BasePopover.Popup
					className={cn(
						"w-64 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-md",
						"data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:translate-y-1 data-starting-style:translate-y-1",
						"transition-[opacity,transform] duration-150 ease-editor-shell motion-reduce:transition-none",
						className,
					)}
					initialFocus={false}
					{...props}
				>
					{children}
				</BasePopover.Popup>
			</BasePopover.Positioner>
		</BasePopover.Portal>
	);
}

export function PopoverTitle({ className, ...props }: PopoverTitleProps): ReactNode {
	return <BasePopover.Title className={cn("font-medium text-sm", className)} {...props} />;
}

export function PopoverDescription({ className, ...props }: PopoverDescriptionProps): ReactNode {
	return (
		<BasePopover.Description
			className={cn("mt-1 text-muted-foreground text-xs", className)}
			{...props}
		/>
	);
}
