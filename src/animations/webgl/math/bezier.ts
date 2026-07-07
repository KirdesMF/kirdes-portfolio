export type Point = {
	x: number;
	y: number;
};

export type CubicBezier = {
	p0: Point;
	p1: Point;
	p2: Point;
	p3: Point;
};

export function cubicBezierPoint({ curve, t }: { curve: CubicBezier; t: number }): Point {
	const clamped = clamp01(t);
	const inv = 1 - clamped;
	const a = inv * inv * inv;
	const b = 3 * inv * inv * clamped;
	const c = 3 * inv * clamped * clamped;
	const d = clamped * clamped * clamped;

	return {
		x: curve.p0.x * a + curve.p1.x * b + curve.p2.x * c + curve.p3.x * d,
		y: curve.p0.y * a + curve.p1.y * b + curve.p2.y * c + curve.p3.y * d,
	};
}

export function clamp01(value: number): number {
	return Math.max(0, Math.min(1, value));
}
