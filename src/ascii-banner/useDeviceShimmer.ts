import { useCallback, useEffect, useMemo, useRef } from "react";

type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
	requestPermission?: () => Promise<"granted" | "denied">;
};

export function useDeviceShimmer() {
	const isEnabledRef = useRef(false);
	const targetRef = useRef<number | null>(null);
	const valueRef = useRef<number | null>(null);

	useEffect(() => {
		const handleOrientation = (event: DeviceOrientationEvent) => {
			if (!isEnabledRef.current || event.gamma === null) return;

			const clampedGamma = Math.max(-35, Math.min(35, event.gamma));
			targetRef.current = (clampedGamma + 35) / 70;
		};

		window.addEventListener("deviceorientation", handleOrientation);
		return () => window.removeEventListener("deviceorientation", handleOrientation);
	}, []);

	const enable = useCallback(async () => {
		const OrientationEvent = DeviceOrientationEvent as DeviceOrientationEventWithPermission;

		if (typeof OrientationEvent.requestPermission === "function") {
			const permission = await OrientationEvent.requestPermission();
			isEnabledRef.current = permission === "granted";
			return;
		}

		isEnabledRef.current = true;
	}, []);

	const getValue = useCallback(() => {
		const target = targetRef.current;
		if (target === null) return null;

		const current = valueRef.current ?? target;
		const next = current + (target - current) * 0.14;
		valueRef.current = next;
		return next;
	}, []);

	return useMemo(() => ({ enable, getValue }), [enable, getValue]);
}
