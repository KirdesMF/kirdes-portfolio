import { Radio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "#/design-system/cn";
import { FocusPixelBand } from "#/design-system/focus-pixel-band";

type RadioGroupProps<TValue = string> = Omit<
	ComponentProps<typeof BaseRadioGroup<TValue>>,
	"className"
> & {
	className?: string;
};
type RadioGroupItemProps<TValue = string> = Omit<
	ComponentProps<typeof Radio.Root<TValue>>,
	"className"
> & {
	className?: string;
};
type RadioGroupIndicatorProps = Omit<ComponentProps<typeof Radio.Indicator>, "className"> & {
	className?: string;
};

export function RadioGroup<TValue = string>({
	className,
	...props
}: RadioGroupProps<TValue>): ReactNode {
	return <BaseRadioGroup className={cn("grid gap-2", className)} {...props} />;
}

export function RadioGroupItem<TValue = string>({
	children,
	className,
	...props
}: RadioGroupItemProps<TValue>): ReactNode {
	return (
		<Radio.Root
			className={cn(
				"group relative flex items-center justify-between gap-3 border-thin border-border px-2 py-2 ps-3 text-left outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
				className,
			)}
			{...props}
		>
			<FocusPixelBand />
			{children}
		</Radio.Root>
	);
}

export function RadioGroupIndicator({ className, ...props }: RadioGroupIndicatorProps): ReactNode {
	return <Radio.Indicator className={cn("block", className)} {...props} />;
}
