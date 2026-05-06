import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "#/design-system/cn";

type TooltipProps = ComponentProps<typeof BaseTooltip.Root>;
type TooltipTriggerProps = ComponentProps<typeof BaseTooltip.Trigger>;
type TooltipContentProps = Omit<ComponentProps<typeof BaseTooltip.Popup>, "className"> & {
	align?: ComponentProps<typeof BaseTooltip.Positioner>["align"];
	className?: string;
	side?: ComponentProps<typeof BaseTooltip.Positioner>["side"];
	sideOffset?: ComponentProps<typeof BaseTooltip.Positioner>["sideOffset"];
};

export function Tooltip({ children, ...props }: TooltipProps): ReactNode {
	return (
		<BaseTooltip.Provider delay={0}>
			<BaseTooltip.Root {...props}>{children}</BaseTooltip.Root>
		</BaseTooltip.Provider>
	);
}

export function TooltipTrigger(props: TooltipTriggerProps): ReactNode {
	return <BaseTooltip.Trigger {...props} />;
}

export function TooltipContent({
	align,
	children,
	className,
	side = "bottom",
	sideOffset = 6,
	...props
}: TooltipContentProps): ReactNode {
	return (
		<BaseTooltip.Portal>
			<BaseTooltip.Positioner align={align} side={side} sideOffset={sideOffset}>
				<BaseTooltip.Popup
					className={cn(
						"flex items-center gap-2 rounded-md border border-border bg-popover px-2 py-1 text-popover-foreground text-xs shadow-md",
						"data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:translate-y-0.5 data-starting-style:translate-y-0.5",
						"transition-[opacity,transform] duration-150 ease-editor-shell motion-reduce:transition-none",
						className,
					)}
					{...props}
				>
					{children}
				</BaseTooltip.Popup>
			</BaseTooltip.Positioner>
		</BaseTooltip.Portal>
	);
}
