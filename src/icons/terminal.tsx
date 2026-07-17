import type { ComponentProps } from "react";

export function TerminalIcon(props: ComponentProps<"svg">) {
	return (
		<svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
			<path d="M20 22H4v-2h16v2ZM4 20H2V4h2v16Zm18 0h-2V4h2v16ZM8 18H6v-2h2v2Zm8 0h-4v-2h4v2Zm-6-2H8v-2h2v2Zm-2-2H6v-2h2v2ZM20 4H4V2h16v2Z" />
		</svg>
	);
}
