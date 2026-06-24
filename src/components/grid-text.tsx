import { type ComponentPropsWithoutRef, useId } from "react";

type GridTextProps = ComponentPropsWithoutRef<"div"> & {
	text: string;
	fill?: "pattern" | "solid";
};

export function GridText({ text, fill = "pattern", className, ...props }: GridTextProps) {
	const patternId = useId().replaceAll(":", "");
	const textFill = fill === "solid" ? "currentColor" : `url(#${patternId})`;

	return (
		<div className={["relative", className].filter(Boolean).join(" ")} {...props}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 1920 270.06"
				className="block w-full overflow-visible text-current"
				aria-label={text}
				role="img"
			>
				{fill === "pattern" ? (
					<defs>
						<pattern
							id={patternId}
							patternUnits="userSpaceOnUse"
							width="8"
							height="8"
							patternTransform="rotate(-45)"
						>
							<rect width="8" height="8" fill="transparent" />
							<line x1="0" y1="0" x2="0" y2="8" stroke="currentColor" strokeWidth="0.75" />
						</pattern>
					</defs>
				) : null}
				<text
					x="0"
					y="222"
					textLength="1920"
					lengthAdjust="spacingAndGlyphs"
					fill={textFill}
					stroke="currentColor"
					strokeWidth="2"
					fontFamily="var(--font-sans)"
					fontSize="400"
					style={{ fontVariationSettings: '"wght" 850, "wdth" 70' }}
				>
					{text}
				</text>
			</svg>
		</div>
	);
}
