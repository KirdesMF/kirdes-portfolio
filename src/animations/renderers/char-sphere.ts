import { AnimationTheme } from "../theme";

type Vector3 = {
	x: number;
	y: number;
	z: number;
};

const CHARACTERS = "  iIlL1XHMW@";
const ENTER_TRANSITION_SECONDS = 0.45;
const ORBIT_SPEED = 0.7;
const SPHERE_RADIUS_RATIO = 1 / 3.4;

export class CharSphereRenderer {
	private readonly context: CanvasRenderingContext2D;
	private readonly abortController = new AbortController();
	private readonly theme: AnimationTheme;
	private width = 1;
	private height = 1;
	private dpr = 1;
	private pointerX = 0;
	private pointerY = 0;
	private pointerActive = false;
	private interactionStartTime = 0;
	private autoStartTime = 0;
	private hasLeavePosition = false;
	private leaveLight: Vector3 = { x: 1, y: 0, z: 0 };
	private lastLight: Vector3 = { x: 1, y: 0, z: 0 };

	constructor(private readonly canvas: HTMLCanvasElement) {
		const context = canvas.getContext("2d", { alpha: false });

		if (!context) {
			throw new Error("Could not create 2D canvas context.");
		}

		this.context = context;
		this.theme = new AnimationTheme(canvas);

		const { signal } = this.abortController;
		canvas.addEventListener("pointermove", (event) => this.updatePointer(event), { signal });
		canvas.addEventListener("pointerenter", (event) => this.updatePointer(event), { signal });
		canvas.addEventListener(
			"pointerleave",
			() => {
				this.pointerActive = false;
				this.leaveLight = this.lastLight;
				this.autoStartTime = performance.now() * 0.001;
				this.hasLeavePosition = true;
			},
			{ signal },
		);
	}

	resize() {
		const rect = this.canvas.getBoundingClientRect();
		this.dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
		const width = Math.max(1, Math.round(rect.width * this.dpr));
		const height = Math.max(1, Math.round(rect.height * this.dpr));

		if (this.canvas.width !== width || this.canvas.height !== height) {
			this.canvas.width = width;
			this.canvas.height = height;
		}

		this.width = rect.width;
		this.height = rect.height;
		this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
	}

	render(timestamp: number) {
		const time = timestamp * 0.001;
		const automaticLight = this.hasLeavePosition
			? rotateAroundY(this.leaveLight, Math.max(0, time - this.autoStartTime) * ORBIT_SPEED)
			: normalize({
					x: Math.cos(0.75 * time),
					y: 0.8,
					z: Math.sin(0.625 * time),
				});
		const pointerLight = normalize({
			x: -this.pointerX,
			y: -this.pointerY,
			z: -0.8,
		});
		const interactionMix = this.pointerActive
			? smoothstep(0, ENTER_TRANSITION_SECONDS, Math.max(0, time - this.interactionStartTime))
			: 0;
		const light = normalize(mixVector(automaticLight, pointerLight, interactionMix));

		this.lastLight = light;
		this.drawSphere(light);
	}

	dispose() {
		this.abortController.abort();
		this.theme.dispose();
	}

	private updatePointer(event: PointerEvent) {
		const rect = this.canvas.getBoundingClientRect();
		this.pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		this.pointerY = 1 - ((event.clientY - rect.top) / rect.height) * 2;

		if (!this.pointerActive) {
			this.interactionStartTime = performance.now() * 0.001;
		}

		this.pointerActive = true;
	}

	private drawSphere(light: Vector3) {
		const centerX = this.width * 0.5;
		const centerY = this.height * 0.5;
		const radius = Math.min(this.width, this.height) * SPHERE_RADIUS_RATIO;
		const cell = Math.max(8, Math.min(12, radius * 0.045));
		const context = this.context;

		context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		context.fillStyle = this.theme.palette.background;
		context.fillRect(0, 0, this.width, this.height);
		context.fillStyle = this.theme.palette.text;
		context.font = `${cell * 1.15}px "Geist Mono", monospace`;
		context.textAlign = "center";
		context.textBaseline = "middle";

		for (let y = centerY - radius; y <= centerY + radius; y += cell) {
			for (let x = centerX - radius; x <= centerX + radius; x += cell) {
				const sphereX = (x - centerX) / radius;
				const sphereY = (centerY - y) / radius;
				const distanceSquared = sphereX * sphereX + sphereY * sphereY;

				if (distanceSquared > 1) {
					continue;
				}

				const sphereZ = Math.sqrt(1 - distanceSquared);
				const value = Math.max(
					0,
					Math.min(1, 0.57 + 0.5 * (light.x * sphereX + light.y * sphereY + light.z * sphereZ)),
				);
				const character = CHARACTERS[Math.floor(value * (CHARACTERS.length - 1))] ?? " ";

				if (character !== " ") {
					context.globalAlpha = 0.35 + value * 0.65;
					context.fillText(character, x, y);
				}
			}
		}

		context.globalAlpha = 1;
	}
}

function normalize(vector: Vector3): Vector3 {
	const length = Math.hypot(vector.x, vector.y, vector.z) || 1;

	return {
		x: vector.x / length,
		y: vector.y / length,
		z: vector.z / length,
	};
}

function mixVector(from: Vector3, to: Vector3, amount: number): Vector3 {
	return {
		x: from.x + (to.x - from.x) * amount,
		y: from.y + (to.y - from.y) * amount,
		z: from.z + (to.z - from.z) * amount,
	};
}

function rotateAroundY(vector: Vector3, angle: number): Vector3 {
	const cosine = Math.cos(angle);
	const sine = Math.sin(angle);

	return {
		x: cosine * vector.x + sine * vector.z,
		y: vector.y,
		z: -sine * vector.x + cosine * vector.z,
	};
}

function smoothstep(edge0: number, edge1: number, value: number) {
	const amount = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));

	return amount * amount * (3 - 2 * amount);
}
