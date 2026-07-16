import {
	CircleCheck,
	Cloud,
	CloudDrizzle,
	CloudFog,
	CloudLightning,
	CloudRain,
	CloudSun,
	Globe2,
	type LucideIcon,
	Snowflake,
	Sun,
	Terminal,
	XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	Popover,
	PopoverClose,
	PopoverContent,
	PopoverTitle,
	PopoverTrigger,
} from "#/design-system/popover";
import type { WeatherData } from "#/ide/status-box.functions";

type TerminalStatus = {
	cpu: number;
	gpu: number;
	memory: number;
};

type StatusBoxProps = {
	onOpenChange: (open: boolean) => void;
	open: boolean;
	weather: WeatherData | null;
};

export function StatusBox({ onOpenChange, open, weather }: StatusBoxProps) {
	const [terminalStatus, setTerminalStatus] = useState<TerminalStatus>({
		cpu: 18,
		gpu: 32,
		memory: 61,
	});

	useEffect(() => {
		const interval = window.setInterval(() => {
			setTerminalStatus((current) => ({
				cpu: fluctuate(current.cpu, 5),
				gpu: fluctuate(current.gpu, 4),
				memory: fluctuate(current.memory, 2),
			}));
		}, 2500);

		return () => window.clearInterval(interval);
	}, []);

	return (
		<Popover open={open} onOpenChange={onOpenChange}>
			<PopoverTrigger
				aria-label="Toggle system status"
				className="flex h-full cursor-pointer items-center px-2.5 text-status-muted-foreground transition hover:bg-status-primary hover:text-status-primary-foreground focus:bg-status-primary focus:text-status-primary-foreground focus:outline-none"
			>
				[i] status
			</PopoverTrigger>
			<PopoverContent
				align="end"
				alignOffset={30}
				className="w-[min(17rem,calc(100vw-3rem))] rounded-none bg-popover p-0 shadow-none outline-none"
				side="top"
				sideOffset={12}
			>
				<div className="relative border-thin border-border bg-popover p-3 pt-4 text-tiny leading-4">
					<PopoverTitle className="absolute top-0 inset-s-1/2 z-raised -translate-1/2 border-x-thin border-border bg-popover px-2 text-primary leading-none">
						STATUS
					</PopoverTitle>
					<PopoverClose
						aria-label="Close status box"
						className="absolute top-0 end-2 z-raised -translate-y-1/2 bg-popover px-1 text-primary leading-none focus:text-accent-foreground focus:outline-none"
					>
						<span aria-hidden="true" className="flex items-center">
							[<XIcon className="size-3" />]
						</span>
					</PopoverClose>

					<div className="grid gap-2">
						<p className="flex items-center gap-2">
							<Globe2
								aria-hidden="true"
								className="size-3 shrink-0 text-muted-foreground"
								data-testid="location-icon"
							/>
							Bussy-en-Othe, France
						</p>

						<div aria-live="polite">{renderWeather(weather)}</div>

						<p className="flex items-center gap-2 text-primary">
							<CircleCheck aria-hidden="true" className="size-3 shrink-0" />
							Available for work
						</p>

						<section className="border-border border-t-thin pt-2">
							<h3 className="mb-1 flex items-center gap-2 text-muted-foreground">
								<Terminal aria-hidden="true" className="size-3 shrink-0" />
								TERMINAL
							</h3>
							<dl className="grid grid-cols-[1fr_auto] gap-x-4 font-mono tabular-nums">
								<dt>cpu_load</dt>
								<dd>{terminalStatus.cpu}%</dd>
								<dt>gpu_load</dt>
								<dd>{terminalStatus.gpu}%</dd>
								<dt>mem_used</dt>
								<dd>{terminalStatus.memory}%</dd>
								<dt>system</dt>
								<dd className="text-primary">[LIVE]</dd>
							</dl>
						</section>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

function renderWeather(weather: WeatherData | null) {
	if (!weather) {
		return (
			<p className="flex items-center gap-2">
				<Cloud aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" />
				Weather unavailable
			</p>
		);
	}

	const { Icon, label } = weatherDetails(weather.weatherCode);

	return (
		<p className="flex items-center gap-2">
			<Icon
				aria-hidden="true"
				className="size-3 shrink-0 text-muted-foreground"
				data-testid="weather-icon"
				data-weather-code={weather.weatherCode}
			/>
			{Math.round(weather.temperature)}°C / {label}
		</p>
	);
}

function weatherDetails(code: number): { Icon: LucideIcon; label: string } {
	if (code === 0) return { Icon: Sun, label: "Clear" };
	if (code <= 2) return { Icon: CloudSun, label: "Partly cloudy" };
	if (code === 3) return { Icon: Cloud, label: "Overcast" };
	if (code === 45 || code === 48) return { Icon: CloudFog, label: "Fog" };
	if (code >= 51 && code <= 57) return { Icon: CloudDrizzle, label: "Drizzle" };
	if (code >= 61 && code <= 67) return { Icon: CloudRain, label: "Rain" };
	if (code >= 71 && code <= 77) return { Icon: Snowflake, label: "Snow" };
	if (code >= 80 && code <= 82) return { Icon: CloudRain, label: "Rain showers" };
	if (code === 85 || code === 86) return { Icon: Snowflake, label: "Snow showers" };
	if (code >= 95) return { Icon: CloudLightning, label: "Thunderstorm" };
	return { Icon: Cloud, label: "Unknown conditions" };
}

function fluctuate(value: number, range: number) {
	const change = Math.floor(Math.random() * (range * 2 + 1)) - range;
	return Math.min(99, Math.max(1, value + change));
}
