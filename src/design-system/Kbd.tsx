import type { ComponentProps, ReactNode } from "react";

import { cn } from "#/design-system/cn";

type KbdProps = ComponentProps<"kbd">;

export function Kbd({ children, className, ...props }: KbdProps): ReactNode {
	return (
		<kbd
			className={cn(
				"inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 font-medium text-secondary-foreground text-xs uppercase",
				className,
			)}
			{...props}
		>
			{children}
		</kbd>
	);
}
