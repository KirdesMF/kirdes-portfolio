import { Separator as BaseSeparator } from "@base-ui/react/separator";
import type { ComponentProps } from "react";

import { cn } from "#/design-system/cn";

type SeparatorProps = Omit<ComponentProps<typeof BaseSeparator>, "className"> & {
	className?: string;
};

export function Separator({
	className,
	orientation = "horizontal",
	...props
}: SeparatorProps): React.ReactNode {
	return (
		<BaseSeparator
			className={cn(
				orientation === "vertical" ? "h-4 w-px" : "h-px w-full",
				"bg-border",
				className,
			)}
			orientation={orientation}
			{...props}
		/>
	);
}
