import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "#/design-system/cn";

type DrawerProps = ComponentProps<typeof BaseDrawer.Root>;
type DrawerTriggerProps = ComponentProps<typeof BaseDrawer.Trigger>;
type DrawerCloseProps = ComponentProps<typeof BaseDrawer.Close>;
type DrawerContentProps = Omit<ComponentProps<typeof BaseDrawer.Popup>, "className"> & {
	className?: string;
};
type DrawerTitleProps = Omit<ComponentProps<typeof BaseDrawer.Title>, "className"> & {
	className?: string;
};
type DrawerDescriptionProps = Omit<ComponentProps<typeof BaseDrawer.Description>, "className"> & {
	className?: string;
};
type DrawerHandleProps = ComponentProps<"div">;

export function Drawer({ swipeDirection = "down", ...props }: DrawerProps): ReactNode {
	return <BaseDrawer.Root swipeDirection={swipeDirection} {...props} />;
}

export function DrawerTrigger(props: DrawerTriggerProps): ReactNode {
	return <BaseDrawer.Trigger data-slot="drawer-trigger" {...props} />;
}

export function DrawerClose(props: DrawerCloseProps): ReactNode {
	return <BaseDrawer.Close data-slot="drawer-close" {...props} />;
}

export function DrawerContent({ children, className, ...props }: DrawerContentProps): ReactNode {
	return (
		<BaseDrawer.Portal>
			<BaseDrawer.Backdrop
				className="fixed inset-0 bg-black/40 opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0"
				data-slot="drawer-backdrop"
			/>
			<BaseDrawer.Viewport
				className="fixed inset-0 grid grid-rows-[1fr_auto] touch-none pt-12"
				data-slot="drawer-viewport"
			>
				<BaseDrawer.Popup
					className={cn(
						"row-start-2 flex max-h-[min(88dvh,42rem)] min-h-0 w-full flex-col rounded-t-2xl border-t border-border bg-popover text-popover-foreground shadow-lg outline-none touch-none",
						"transform-[translateY(var(--drawer-swipe-movement-y))] transition-[transform,opacity] duration-300 ease-out will-change-transform",
						"data-starting-style:transform-[translateY(100%)] data-ending-style:transform-[translateY(100%)] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*300ms)] data-swiping:select-none data-swiping:duration-0",
						className,
					)}
					data-slot="drawer-popup"
					{...props}
				>
					{children}
				</BaseDrawer.Popup>
			</BaseDrawer.Viewport>
		</BaseDrawer.Portal>
	);
}

export function DrawerTitle({ className, ...props }: DrawerTitleProps): ReactNode {
	return (
		<BaseDrawer.Title
			className={cn("font-medium text-sm", className)}
			data-slot="drawer-title"
			{...props}
		/>
	);
}

export function DrawerDescription({ className, ...props }: DrawerDescriptionProps): ReactNode {
	return (
		<BaseDrawer.Description
			className={cn("text-muted-foreground text-xs", className)}
			data-slot="drawer-description"
			{...props}
		/>
	);
}

export function DrawerHandle({ className, ...props }: DrawerHandleProps): ReactNode {
	return (
		<div
			aria-hidden="true"
			className={cn(
				"flex touch-none justify-center py-2 before:h-1 before:w-12 before:rounded-full before:bg-input",
				className,
			)}
			data-slot="drawer-handle"
			{...props}
		/>
	);
}
