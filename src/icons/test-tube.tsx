import type { ComponentProps } from "react";

export function TestTubeIcon(props: ComponentProps<"svg">) {
	return (
		<svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
			<path d="M14 22h-4v-2h4v2Zm3-18h-1v16h-2v-5h-4v5H8V4H7V2h10v2Zm-7 9h4V4h-4v9Z" />
		</svg>
	);
}
