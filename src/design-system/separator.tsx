import { Separator as BaseSeparator } from "@base-ui/react/separator";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "#/design-system/cn";

type SeparatorProps = Omit<ComponentProps<typeof BaseSeparator>, "className"> & {
	className?: string;
};

export function Separator({
	className,
	orientation = "horizontal",
	...props
}: SeparatorProps): ReactNode {
	return (
		<BaseSeparator
			className={cn(
				"shrink-0 bg-border",
				orientation === "vertical" ? "h-4 w-px" : "h-px w-full",
				className,
			)}
			orientation={orientation}
			{...props}
		/>
	);
}
