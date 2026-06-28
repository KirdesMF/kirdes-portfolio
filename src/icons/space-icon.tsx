import type { ComponentProps } from "react";

export function SpaceIcon(props: ComponentProps<"svg">) {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M5 10v4h14v-4" />
		</svg>
	);
}
