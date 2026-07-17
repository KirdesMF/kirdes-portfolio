import type { ComponentProps } from "react";

export function FolderOpenIcon(props: ComponentProps<"svg">) {
	return (
		<svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
			<path d="M4 4h8v2H4V4Zm8 2h8v2h-8V6ZM2 6h2v10H2V6Zm18 2h2v6h-2V8Z" />
			<path d="M6 10h18v2H6v-2Zm-2 2h2v2H4v-2Zm18 0h2v2h-2v-2ZM2 14h2v4H2v-4Zm18 0h2v4h-2v-4ZM4 18h16v2H4v-2Z" />
		</svg>
	);
}
