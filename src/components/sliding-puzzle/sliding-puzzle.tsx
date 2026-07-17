import { useSlidingPuzzle } from "./use-sliding-puzzle";

type SlidingPuzzleProps = {
	size?: number;
};

export function SlidingPuzzle({ size = 4 }: SlidingPuzzleProps) {
	const {
		canvasRef,
		handleKeyDown,
		handlePointerCancel,
		handlePointerDown,
		handlePointerEnter,
		handlePointerLeave,
		handlePointerMove,
		handlePointerUp,
		moves,
		patternId,
		ready,
		resolvePuzzle,
		resolving,
		solved,
		solvedMessage,
		startNewGame,
	} = useSlidingPuzzle(size);

	return (
		<section className="grid gap-3" aria-labelledby="puzzle-title">
			<div className="flex items-baseline justify-between gap-3">
				<h2 className="text-primary text-tiny uppercase" id="puzzle-title">
					Portrait puzzle · {size}×{size}
				</h2>
				<span className="text-muted-foreground text-tiny tabular-nums">{moves} moves</span>
			</div>
			<div className="relative aspect-square w-full border-border border-thin bg-[#161616]">
				<svg
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 size-full"
					preserveAspectRatio="none"
					viewBox="0 0 100 100"
				>
					<defs>
						<pattern height="3" id={patternId} patternUnits="userSpaceOnUse" width="3">
							<rect fill="#161616" height="3" width="3" />
							<path
								d="M-1 1 1-1M0 3 3 0M2 4 4 2"
								fill="none"
								stroke="white"
								strokeOpacity="0.2"
								strokeWidth="0.1"
							/>
						</pattern>
					</defs>
					<rect fill={`url(#${patternId})`} height="100" width="100" />
				</svg>
				<canvas
					aria-label={`${size} by ${size} sliding portrait puzzle. ${resolving ? "Resolving automatically." : solved ? solvedMessage : "Move tiles into the empty space."}`}
					className="absolute inset-0 size-full cursor-grab touch-none active:cursor-grabbing focus:outline-2 focus:outline-primary focus:outline-offset-2"
					onKeyDown={handleKeyDown}
					onPointerCancel={handlePointerCancel}
					onPointerDown={handlePointerDown}
					onPointerEnter={handlePointerEnter}
					onPointerLeave={handlePointerLeave}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					ref={canvasRef}
					tabIndex={0}
				/>
			</div>
			<p className="text-muted-foreground text-tiny leading-4" aria-live="polite">
				{!ready
					? "Preparing portrait…"
					: resolving
						? "Resolving at high speed…"
						: solved
							? solvedMessage
							: "Drag a neighboring tile into the gap or use arrow keys."}
			</p>
			<div className="flex flex-wrap gap-2">
				<button
					className="border-thin border-primary bg-primary px-3 py-2 text-primary-foreground text-tiny hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
					disabled={!ready || solved || resolving}
					type="button"
					onClick={resolvePuzzle}
				>
					{resolving ? "Resolving…" : "Resolve"}
				</button>
				<button
					className="border-thin border-border px-3 py-2 text-foreground text-tiny hover:border-primary hover:text-primary focus:border-primary focus:text-primary focus:outline-none"
					type="button"
					onClick={startNewGame}
				>
					Shuffle
				</button>
			</div>
		</section>
	);
}
