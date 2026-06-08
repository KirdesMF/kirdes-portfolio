import { Command as BaseCommand } from "cmdk";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "#/design-system/cn";

type CommandProps = Omit<ComponentProps<typeof BaseCommand>, "className"> & {
	className?: string;
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
				"flex min-h-0 w-full flex-col rounded-md bg-popover text-popover-foreground",
				className,
			)}
			{...props}
		/>
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
			className={cn("overflow-y-auto overflow-x-hidden p-1", className)}
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
				"flex cursor-default items-center gap-2  py-1.5 text-xs data-selected:bg-accent data-selected:text-accent-foreground data-disabled:opacity-50",
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
