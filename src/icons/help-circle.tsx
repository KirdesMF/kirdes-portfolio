import type { ComponentProps } from "react";

export function HelpCircleIcon(props: ComponentProps<"svg">) {
	return (
		<svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
			<path d="M20 22H4v-2h16v2ZM4 20H2V4h2v16Zm18 0h-2V4h2v16Zm-9-9v6h-2v-6h2Zm0-2h-2V7h2v2Zm7-5H4V2h16v2Z" />
		</svg>
	);
}
