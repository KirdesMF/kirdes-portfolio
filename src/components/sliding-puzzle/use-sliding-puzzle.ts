import {
	type KeyboardEvent,
	type PointerEvent,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";

import { createShuffle, createSolvedTiles, isSolved, moveTile } from "./sliding-puzzle.utils";

const BAYER_4X4 = [
	[0, 8, 2, 10],
	[12, 4, 14, 6],
	[3, 11, 1, 9],
	[15, 7, 13, 5],
] as const;
const DITHER_SIZE = 120;
const ORIGINAL_SIZE = 640;
const GRAYSCALE_LEVELS = 3;
const MOVE_DURATION_MS = 150;
const RESOLVE_MOVE_DURATION_MS = 24;

type Animation = {
	tile: number;
	from: number;
	to: number;
	progress: number;
	direct?: boolean;
};

type Drag = Animation & {
	pointerId: number;
	startX: number;
	startY: number;
};

function createSquareImage(image: HTMLImageElement, size: number, grayscale = false) {
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const context = canvas.getContext("2d");
	if (!context) return null;
	const cropSize = Math.min(image.naturalWidth, image.naturalHeight);
	const sourceX = (image.naturalWidth - cropSize) / 2;
	const sourceY = (image.naturalHeight - cropSize) / 2;
	if (grayscale) context.filter = "grayscale(1)";
	context.drawImage(image, sourceX, sourceY, cropSize, cropSize, 0, 0, size, size);
	return canvas;
}

function createDitheredImage(image: HTMLImageElement) {
	const canvas = createSquareImage(image, DITHER_SIZE);
	if (!canvas) return null;
	const context = canvas.getContext("2d", { willReadFrequently: true });
	if (!context) return null;
	const imageData = context.getImageData(0, 0, DITHER_SIZE, DITHER_SIZE);
	const step = 255 / (GRAYSCALE_LEVELS - 1);
	for (let pixel = 0; pixel < imageData.data.length; pixel += 4) {
		const x = (pixel / 4) % DITHER_SIZE;
		const y = Math.floor(pixel / 4 / DITHER_SIZE);
		const red = imageData.data[pixel];
		const green = imageData.data[pixel + 1];
		const blue = imageData.data[pixel + 2];
		const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
		const threshold = (BAYER_4X4[y % 4][x % 4] / 15 - 0.5) * step;
		const gray = Math.max(0, Math.min(255, Math.round((luminance + threshold) / step) * step));
		imageData.data[pixel] = gray;
		imageData.data[pixel + 1] = gray;
		imageData.data[pixel + 2] = gray;
	}
	context.putImageData(imageData, 0, 0);
	return canvas;
}

export function useSlidingPuzzle(size: number) {
	const patternId = useId().replaceAll(":", "");
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const imageRef = useRef<HTMLCanvasElement | null>(null);
	const originalImageRef = useRef<HTMLCanvasElement | null>(null);
	const originalRevealRef = useRef(0);
	const originalRevealFrameRef = useRef(0);
	const [initialTiles] = useState(() => createSolvedTiles(size));
	const tilesRef = useRef(initialTiles);
	const animationFrameRef = useRef(0);
	const animationRef = useRef<Animation | null>(null);
	const dragRef = useRef<Drag | null>(null);
	const solutionMovesRef = useRef<number[]>([]);
	const [tiles, setTiles] = useState(initialTiles);
	const [moves, setMoves] = useState(0);
	const [ready, setReady] = useState(false);
	const [resolvedAutomatically, setResolvedAutomatically] = useState(false);
	const [resolving, setResolving] = useState(false);
	const solved = ready && isSolved(tiles);

	const updateTiles = useCallback((next: number[]) => {
		tilesRef.current = next;
		setTiles(next);
	}, []);

	const drawBoard = useCallback(
		(board: readonly number[], animation: Animation | null = null) => {
			const canvas = canvasRef.current;
			const image = imageRef.current;
			if (!canvas || !image) return;
			const context = canvas.getContext("2d");
			if (!context) return;

			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const displaySize = canvas.getBoundingClientRect().width;
			const targetSize = Math.max(1, Math.round(displaySize * dpr));
			if (canvas.width !== targetSize || canvas.height !== targetSize) {
				canvas.width = targetSize;
				canvas.height = targetSize;
			}

			const cellSize = targetSize / size;
			const sourceSize = DITHER_SIZE / size;
			const emptyTile = size * size - 1;
			const complete = isSolved(board);
			context.clearRect(0, 0, targetSize, targetSize);
			context.imageSmoothingEnabled = false;

			function drawTile(tile: number, x: number, y: number) {
				const sourceX = (tile % size) * sourceSize;
				const sourceY = Math.floor(tile / size) * sourceSize;
				context?.drawImage(
					image as HTMLCanvasElement,
					sourceX,
					sourceY,
					sourceSize,
					sourceSize,
					x + 1,
					y + 1,
					cellSize - 2,
					cellSize - 2,
				);
			}

			for (let cell = 0; cell < board.length; cell++) {
				const tile = board[cell];
				if (tile === emptyTile || animation?.from === cell) continue;
				drawTile(tile, (cell % size) * cellSize, Math.floor(cell / size) * cellSize);
			}

			if (complete) {
				drawTile(emptyTile, (emptyTile % size) * cellSize, Math.floor(emptyTile / size) * cellSize);
			}

			if (animation) {
				const fromX = (animation.from % size) * cellSize;
				const fromY = Math.floor(animation.from / size) * cellSize;
				const toX = (animation.to % size) * cellSize;
				const toY = Math.floor(animation.to / size) * cellSize;
				const eased = animation.direct ? animation.progress : 1 - (1 - animation.progress) ** 3;
				drawTile(animation.tile, fromX + (toX - fromX) * eased, fromY + (toY - fromY) * eased);
			}

			const originalImage = originalImageRef.current;
			if (complete && originalImage && originalRevealRef.current > 0) {
				context.globalAlpha = originalRevealRef.current;
				context.imageSmoothingEnabled = true;
				context.drawImage(originalImage, 0, 0, targetSize, targetSize);
				context.globalAlpha = 1;
				context.imageSmoothingEnabled = false;
			}
		},
		[size],
	);

	const animateOriginalReveal = useCallback(
		(target: number) => {
			window.cancelAnimationFrame(originalRevealFrameRef.current);
			const start = originalRevealRef.current;
			const startedAt = performance.now();
			const duration = 360 * Math.abs(target - start);
			if (duration === 0) return;

			function frame(now: number) {
				const progress = Math.min(1, (now - startedAt) / duration);
				const eased = progress * progress * (3 - 2 * progress);
				originalRevealRef.current = start + (target - start) * eased;
				drawBoard(tilesRef.current, animationRef.current);
				if (progress < 1) {
					originalRevealFrameRef.current = window.requestAnimationFrame(frame);
				}
			}
			originalRevealFrameRef.current = window.requestAnimationFrame(frame);
		},
		[drawBoard],
	);

	const startNewGame = useCallback(() => {
		window.cancelAnimationFrame(animationFrameRef.current);
		window.cancelAnimationFrame(originalRevealFrameRef.current);
		originalRevealRef.current = 0;
		animationRef.current = null;
		dragRef.current = null;
		setMoves(0);
		setResolvedAutomatically(false);
		setResolving(false);
		const shuffled = createShuffle(size);
		solutionMovesRef.current = shuffled.solutionMoves;
		updateTiles(shuffled.tiles);
		drawBoard(shuffled.tiles);
	}, [drawBoard, size, updateTiles]);

	const resolvePuzzle = useCallback(() => {
		window.cancelAnimationFrame(animationFrameRef.current);
		dragRef.current = null;
		setResolving(true);
		const remainingMoves = [...solutionMovesRef.current];

		function moveNext() {
			const cell = remainingMoves.shift();
			if (cell === undefined) {
				animationRef.current = null;
				solutionMovesRef.current = [];
				setResolvedAutomatically(true);
				setResolving(false);
				return;
			}

			const current = tilesRef.current;
			const next = moveTile(current, cell, size);
			if (!next) {
				moveNext();
				return;
			}
			const emptyCell = current.indexOf(size * size - 1);
			const animation = { tile: current[cell], from: cell, to: emptyCell, progress: 0 };
			animationRef.current = animation;
			const startedAt = performance.now();

			function frame(now: number) {
				animation.progress = Math.min(1, (now - startedAt) / RESOLVE_MOVE_DURATION_MS);
				drawBoard(current, animation);
				if (animation.progress < 1) {
					animationFrameRef.current = window.requestAnimationFrame(frame);
					return;
				}
				updateTiles(next as number[]);
				moveNext();
			}
			animationFrameRef.current = window.requestAnimationFrame(frame);
		}

		moveNext();
	}, [drawBoard, size, updateTiles]);

	const animateMove = useCallback(
		(cell: number) => {
			if (animationRef.current || solved) return;
			const current = tilesRef.current;
			const next = moveTile(current, cell, size);
			if (!next) return;
			const emptyCell = current.indexOf(size * size - 1);
			const animation = { tile: current[cell], from: cell, to: emptyCell, progress: 0 };
			animationRef.current = animation;
			const startedAt = performance.now();

			function frame(now: number) {
				animation.progress = Math.min(1, (now - startedAt) / MOVE_DURATION_MS);
				drawBoard(current, animation);
				if (animation.progress < 1) {
					animationFrameRef.current = window.requestAnimationFrame(frame);
					return;
				}
				animationRef.current = null;
				solutionMovesRef.current.unshift(emptyCell);
				updateTiles(next as number[]);
				setMoves((count) => count + 1);
			}
			animationFrameRef.current = window.requestAnimationFrame(frame);
		},
		[drawBoard, size, solved, updateTiles],
	);

	const settleDrag = useCallback(
		(commit: boolean) => {
			const activeDrag = dragRef.current;
			if (!activeDrag) return;
			const drag = activeDrag;
			dragRef.current = null;
			const current = tilesRef.current;
			const next = moveTile(current, drag.from, size);
			const startProgress = drag.progress;
			const targetProgress = commit ? 1 : 0;
			const startedAt = performance.now();
			const duration = Math.max(1, MOVE_DURATION_MS * Math.abs(targetProgress - startProgress));
			animationRef.current = drag;

			function frame(now: number) {
				const elapsed = Math.min(1, (now - startedAt) / duration);
				const eased = 1 - (1 - elapsed) ** 3;
				drag.progress = startProgress + (targetProgress - startProgress) * eased;
				drag.direct = true;
				drawBoard(current, drag);
				if (elapsed < 1) {
					animationFrameRef.current = window.requestAnimationFrame(frame);
					return;
				}
				animationRef.current = null;
				if (commit && next) {
					solutionMovesRef.current.unshift(drag.to);
					updateTiles(next);
					setMoves((count) => count + 1);
					return;
				}
				drawBoard(current);
			}
			animationFrameRef.current = window.requestAnimationFrame(frame);
		},
		[drawBoard, size, updateTiles],
	);

	useEffect(() => {
		const image = new Image();
		image.src = "/Generated image 1.png";
		image.onload = () => {
			imageRef.current = createDitheredImage(image);
			originalImageRef.current = createSquareImage(image, ORIGINAL_SIZE, true);
			setReady(true);
			const shuffled = createShuffle(size);
			setMoves(0);
			setResolvedAutomatically(false);
			setResolving(false);
			solutionMovesRef.current = shuffled.solutionMoves;
			updateTiles(shuffled.tiles);
			drawBoard(shuffled.tiles);
		};
		return () => {
			image.onload = null;
		};
	}, [drawBoard, size, updateTiles]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const observer = new ResizeObserver(() => drawBoard(tilesRef.current, animationRef.current));
		observer.observe(canvas);
		return () => observer.disconnect();
	}, [drawBoard]);

	useEffect(() => {
		drawBoard(tiles);
	}, [drawBoard, tiles]);

	useEffect(() => {
		if (!solved) return;
		animateOriginalReveal(canvasRef.current?.matches(":hover") ? 1 : 0);
	}, [animateOriginalReveal, solved]);

	useEffect(
		() => () => {
			window.cancelAnimationFrame(animationFrameRef.current);
			window.cancelAnimationFrame(originalRevealFrameRef.current);
		},
		[],
	);

	function handlePointerDown(event: PointerEvent<HTMLCanvasElement>) {
		if (!ready || solved || animationRef.current) return;
		const bounds = event.currentTarget.getBoundingClientRect();
		const column = Math.min(
			size - 1,
			Math.floor(((event.clientX - bounds.left) / bounds.width) * size),
		);
		const row = Math.min(
			size - 1,
			Math.floor(((event.clientY - bounds.top) / bounds.height) * size),
		);
		const cell = row * size + column;
		const current = tilesRef.current;
		if (!moveTile(current, cell, size)) return;
		const emptyCell = current.indexOf(size * size - 1);
		const drag: Drag = {
			pointerId: event.pointerId,
			tile: current[cell],
			from: cell,
			to: emptyCell,
			startX: event.clientX,
			startY: event.clientY,
			progress: 0,
			direct: true,
		};
		dragRef.current = drag;
		animationRef.current = drag;
		event.currentTarget.setPointerCapture(event.pointerId);
	}

	function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
		const drag = dragRef.current;
		if (!drag || drag.pointerId !== event.pointerId) return;
		const bounds = event.currentTarget.getBoundingClientRect();
		const cellSize = bounds.width / size;
		const fromColumn = drag.from % size;
		const fromRow = Math.floor(drag.from / size);
		const toColumn = drag.to % size;
		const toRow = Math.floor(drag.to / size);
		const horizontal = toColumn - fromColumn;
		const vertical = toRow - fromRow;
		const distance = horizontal
			? (event.clientX - drag.startX) * Math.sign(horizontal)
			: (event.clientY - drag.startY) * Math.sign(vertical);
		drag.progress = Math.max(0, Math.min(1, distance / cellSize));
		drawBoard(tilesRef.current, drag);
	}

	function handlePointerUp(event: PointerEvent<HTMLCanvasElement>) {
		const drag = dragRef.current;
		if (!drag || drag.pointerId !== event.pointerId) return;
		event.currentTarget.releasePointerCapture(event.pointerId);
		settleDrag(drag.progress >= 0.35);
	}

	function handlePointerCancel(event: PointerEvent<HTMLCanvasElement>) {
		if (dragRef.current?.pointerId !== event.pointerId) return;
		settleDrag(false);
	}

	function handlePointerEnter() {
		if (solved) animateOriginalReveal(1);
	}

	function handlePointerLeave() {
		if (solved) animateOriginalReveal(0);
	}

	function handleKeyDown(event: KeyboardEvent<HTMLCanvasElement>) {
		const emptyCell = tilesRef.current.indexOf(size * size - 1);
		const row = Math.floor(emptyCell / size);
		const column = emptyCell % size;
		let cell = -1;
		if (event.key === "ArrowUp" && row < size - 1) cell = emptyCell + size;
		if (event.key === "ArrowDown" && row > 0) cell = emptyCell - size;
		if (event.key === "ArrowLeft" && column < size - 1) cell = emptyCell + 1;
		if (event.key === "ArrowRight" && column > 0) cell = emptyCell - 1;
		if (cell < 0) return;
		event.preventDefault();
		animateMove(cell);
	}

	const solvedMessage = resolvedAutomatically
		? "Portrait resolved. Hover to reveal the original."
		: `Solved in ${moves} moves. Hover to reveal the original.`;

	return {
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
		size,
		solved,
		solvedMessage,
		startNewGame,
	};
}
