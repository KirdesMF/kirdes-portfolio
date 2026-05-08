import { useEffect, useState } from "react";

function getCurrentTimestamp(): number {
	return Date.now();
}

function formatTime(timestamp: number): string {
	const date = new Date(timestamp);
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");
	const seconds = date.getSeconds().toString().padStart(2, "0");

	return `${hours}:${minutes}:${seconds}`;
}

export function AppHeaderTime() {
	const [timestamp, setTimestamp] = useState<number>(getCurrentTimestamp);

	useEffect(() => {
		const intervalId: ReturnType<typeof setInterval> = setInterval(() => {
			setTimestamp(getCurrentTimestamp());
		}, 1000);

		return () => {
			clearInterval(intervalId);
		};
	}, []);

	return (
		<span className="text-tiny text-muted-foreground tabular-nums">{formatTime(timestamp)}</span>
	);
}
