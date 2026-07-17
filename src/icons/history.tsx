import type { ComponentProps } from "react";

export function HistoryIcon(props: ComponentProps<"svg">) {
	return (
		<svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
			<path d="M18 22H6v-2h12v2ZM6 20H4v-2h2v2Zm14 0h-2v-2h2v2ZM4 18H2V6h2v12Zm18 0h-2V6h2v12Zm-5-1h-2v-2h2v2Zm-2-2h-2v-2h2v2Zm-2-2h-2V6h2v7ZM6 6H4V4h2v2Zm14 0h-2V4h2v2Zm-2-2H6V2h12v2Z" />
		</svg>
	);
}
