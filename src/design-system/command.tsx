import { Command as BaseCommand } from "cmdk";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "#/design-system/cn";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "#/design-system/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHandle,
	DrawerPopup,
	DrawerTitle,
} from "#/design-system/drawer";
import { useIsMobile } from "#/design-system/use-media-query";

type CommandProps = Omit<ComponentProps<typeof BaseCommand>, "className"> & {
	className?: string;
};
type CommandDialogProps = {
	children: ReactNode;
	commandClassName?: string;
	contentClassName?: string;
	description: string;
	onOpenChange?: (open: boolean) => void;
	open?: boolean;
	title: string;
};
type CommandInputProps = Omit<ComponentProps<typeof BaseCommand.Input>, "className"> & {
	className?: string;
};
type CommandListProps = Omit<ComponentProps<typeof BaseCommand.List>, "className"> & {
	className?: string;
};
type CommandEmptyProps = Omit<ComponentProps<typeof BaseCommand.Empty>, "className"> & {
	className?: string;
};
type CommandGroupProps = Omit<ComponentProps<typeof BaseCommand.Group>, "className"> & {
	className?: string;
};
type CommandItemProps = Omit<ComponentProps<typeof BaseCommand.Item>, "className"> & {
	className?: string;
};
type CommandSeparatorProps = Omit<ComponentProps<typeof BaseCommand.Separator>, "className"> & {
	className?: string;
};
type CommandShortcutProps = ComponentProps<"span">;

export function Command({ className, ...props }: CommandProps): ReactNode {
	return (
		<BaseCommand
			className={cn(
				"flex min-h-0 w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export function CommandDialog({
	children,
	commandClassName,
	contentClassName,
	description,
	title,
	onOpenChange,
	open,
}: CommandDialogProps): ReactNode {
	const isMobile = useIsMobile();
	const inner = (
		Title: typeof DialogTitle | typeof DrawerTitle,
		Description: typeof DialogDescription | typeof DrawerDescription,
	) => (
		<div className="relative flex min-h-0 flex-col rounded border-2 border-border bg-popover p-3 text-popover-foreground">
			<Title className="absolute top-0 inset-s-1/2 z-raised -translate-1/2 border-x-2 border-border bg-popover px-2 text-primary leading-none">
				{title}
			</Title>
			<Description className="sr-only">{description}</Description>
			<Command
				className={cn("rounded-none bg-transparent pt-2", commandClassName)}
				shouldFilter={false}
			>
				{children}
			</Command>
		</div>
	);

	if (isMobile) {
		return (
			<Drawer open={open} onOpenChange={onOpenChange}>
				<DrawerPopup className={cn("px-3 pb-3", contentClassName)}>
					<DrawerHandle />
					<DrawerContent>{inner(DrawerTitle, DrawerDescription)}</DrawerContent>
				</DrawerPopup>
			</Drawer>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className={cn("w-[min(92vw,34rem)]", contentClassName)}>
				{inner(DialogTitle, DialogDescription)}
			</DialogContent>
		</Dialog>
	);
}

export function CommandInput({ className, ...props }: CommandInputProps): ReactNode {
	return (
		<BaseCommand.Input
			className={cn(
				"h-10 w-full border-border border-b bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export function CommandList({ className, ...props }: CommandListProps): ReactNode {
	return (
		<BaseCommand.List
			className={cn("overflow-y-auto overflow-x-hidden scroll-py-1 p-1 outline-none", className)}
			{...props}
		/>
	);
}

export function CommandEmpty({ className, ...props }: CommandEmptyProps): ReactNode {
	return (
		<BaseCommand.Empty className={cn("text-center text-muted-foreground", className)} {...props} />
	);
}

export function CommandGroup({ className, ...props }: CommandGroupProps): ReactNode {
	return (
		<BaseCommand.Group
			className={cn(
				"overflow-hidden p-1 text-foreground text-xs [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export function CommandItem({ className, ...props }: CommandItemProps): ReactNode {
	return (
		<BaseCommand.Item
			className={cn(
				"flex cursor-default items-center gap-2 py-1.5 text-xs outline-none select-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export function CommandSeparator({ className, ...props }: CommandSeparatorProps): ReactNode {
	return (
		<BaseCommand.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
	);
}

export function CommandShortcut({ className, ...props }: CommandShortcutProps): ReactNode {
	return <span className={cn("text-foreground", className)} {...props} />;
}
