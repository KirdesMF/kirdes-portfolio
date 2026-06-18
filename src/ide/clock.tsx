import { ClientOnly } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";

function getCurrentTimestamp(): number {
	return Date.now();
}

function formatTime(timestamp: number): string {
	const date = new Date(timestamp);
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");

	return `${hours}:${minutes}`;
}

export function Clock(): ReactElement {
	return (
		<ClientOnly fallback={<span className="text-tiny tabular-nums">--:--</span>}>
			<ClockClient />
		</ClientOnly>
	);
}

function ClockClient(): ReactElement {
	const [timestamp, setTimestamp] = useState<number>(getCurrentTimestamp);

	useEffect(function startClock(): () => void {
		const intervalId = window.setInterval(function updateTimestamp(): void {
			setTimestamp(getCurrentTimestamp());
		}, 60_000);

		return function cleanup(): void {
			window.clearInterval(intervalId);
		};
	}, []);

	return <span className="text-tiny tabular-nums">{formatTime(timestamp)}</span>;
}
