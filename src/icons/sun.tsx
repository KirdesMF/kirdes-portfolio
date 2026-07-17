import type { ComponentProps } from "react";

export function SunIcon(props: ComponentProps<"svg">) {
	return (
		<svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
			<path d="M14 18h-4v-2h4v2Zm-4-2H8V8h2v8Zm6 0h-2V8h2v8Zm-2-8h-4V6h4v2Zm-1-4h-2V0h2v4Zm0 20h-2v-4h2v4ZM4 13H0v-2h4v2Zm20 0h-4v-2h4v2ZM6 7H4V5H2V3h2v2h2v2Zm16 14h-2v-2h-2v-2h2v2h2v2ZM6 19H4v2H2v-2h2v-2h2v2ZM22 5h-2v2h-2V5h2V3h2v2Z" />
		</svg>
	);
}
