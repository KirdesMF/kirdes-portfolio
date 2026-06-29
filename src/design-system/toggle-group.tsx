import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "#/design-system/cn";
import { FocusPixelBand } from "#/design-system/focus-pixel-band";

type ToggleGroupProps<TValue extends string = string> = Omit<
	ComponentProps<typeof BaseToggleGroup<TValue>>,
	"className"
> & {
	className?: string;
};
type ToggleGroupItemProps<TValue extends string = string> = Omit<
	ComponentProps<typeof BaseToggle<TValue>>,
	"className"
> & {
	className?: string;
};

export function ToggleGroup<TValue extends string = string>({
	className,
	...props
}: ToggleGroupProps<TValue>): ReactNode {
	return <BaseToggleGroup className={cn("flex", className)} {...props} />;
}

export function ToggleGroupItem<TValue extends string = string>({
	children,
	className,
	...props
}: ToggleGroupItemProps<TValue>): ReactNode {
	return (
		<BaseToggle
			className={cn(
				"group relative flex items-center justify-between gap-2 border-thin border-border px-2 py-1.5 ps-3 text-left outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
				className,
			)}
			{...props}
		>
			<FocusPixelBand />
			{children}
		</BaseToggle>
	);
}
