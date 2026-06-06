import { Menu as BaseMenu } from "@base-ui/react/menu";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "#/design-system/cn";

type MenuProps = ComponentProps<typeof BaseMenu.Root>;
type MenuTriggerProps = ComponentProps<typeof BaseMenu.Trigger>;
type MenuContentProps = Omit<ComponentProps<typeof BaseMenu.Popup>, "className"> & {
	align?: ComponentProps<typeof BaseMenu.Positioner>["align"];
	className?: string;
	side?: ComponentProps<typeof BaseMenu.Positioner>["side"];
	sideOffset?: ComponentProps<typeof BaseMenu.Positioner>["sideOffset"];
};
type MenuItemProps = Omit<ComponentProps<typeof BaseMenu.Item>, "className"> & {
	className?: string;
};
type MenuLinkItemProps = Omit<ComponentProps<typeof BaseMenu.LinkItem>, "className"> & {
	className?: string;
};

const menuItemClassName =
	"block rounded-sm px-2 py-1.5 text-muted-foreground text-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground";

export function Menu(props: MenuProps): ReactNode {
	return <BaseMenu.Root {...props} />;
}

export function MenuTrigger(props: MenuTriggerProps): ReactNode {
	return <BaseMenu.Trigger {...props} />;
}

export function MenuContent({
	align = "end",
	children,
	className,
	side = "top",
	sideOffset = 8,
	...props
}: MenuContentProps): ReactNode {
	return (
		<BaseMenu.Portal>
			<BaseMenu.Positioner align={align} side={side} sideOffset={sideOffset}>
				<BaseMenu.Popup
					className={cn(
						"min-w-40 rounded-md border border-border bg-popover text-popover-foreground shadow-md",
						"data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:translate-y-1 data-starting-style:translate-y-1",
						"transition-[opacity,transform] duration-150 ease-editor-shell motion-reduce:transition-none",
						className,
					)}
					{...props}
				>
					{children}
				</BaseMenu.Popup>
			</BaseMenu.Positioner>
		</BaseMenu.Portal>
	);
}

export function MenuItem({ className, ...props }: MenuItemProps): ReactNode {
	return <BaseMenu.Item className={cn(menuItemClassName, className)} {...props} />;
}

export function MenuLinkItem({ className, ...props }: MenuLinkItemProps): ReactNode {
	return <BaseMenu.LinkItem className={cn(menuItemClassName, className)} {...props} />;
}
