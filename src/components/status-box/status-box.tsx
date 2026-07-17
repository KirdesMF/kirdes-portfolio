import { useEffect, useId, useState } from "react";
import type { WeatherData } from "#/components/status-box/status-box.functions";
import { useIsMobile } from "#/design-system/use-media-query";
import { CheckIcon } from "#/icons/check";
import { CloseIcon } from "#/icons/close";
import { CloudIcon } from "#/icons/cloud";
import { CloudDrizzleIcon } from "#/icons/cloud-drizzle";
import { CloudFogIcon } from "#/icons/cloud-fog";
import { CloudLightningIcon } from "#/icons/cloud-lightning";
import { CloudRainIcon } from "#/icons/cloud-rain";
import { CloudSunIcon } from "#/icons/cloud-sun";
import { GlobeIcon } from "#/icons/globe";
import type { IconComponent } from "#/icons/icon.types";
import { PaletteIcon } from "#/icons/palette";
import { SnowflakeIcon } from "#/icons/snowflake";
import { SunIcon } from "#/icons/sun";
import { TerminalIcon } from "#/icons/terminal";
import { themeLabels } from "#/theme/theme.types";
import { useTheme } from "#/theme/use-theme";

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
	const panelId = useId();
	const titleId = useId();
	const isMobile = useIsMobile();
	const { activeTheme, resolvedMode } = useTheme();
	const [terminalStatus, setTerminalStatus] = useState<TerminalStatus>({
		cpu: 18,
		gpu: 32,
		memory: 61,
	});

	useEffect(() => {
		if (isMobile) return;

		const interval = window.setInterval(() => {
			setTerminalStatus((current) => ({
				cpu: fluctuate(current.cpu, 5),
				gpu: fluctuate(current.gpu, 4),
				memory: fluctuate(current.memory, 2),
			}));
		}, 2500);

		return () => window.clearInterval(interval);
	}, [isMobile]);

	if (isMobile) return null;

	return (
		<>
			<button
				aria-controls={panelId}
				aria-expanded={open}
				aria-label="Open system status"
				className="flex h-full cursor-pointer items-center px-2.5 text-status-muted-foreground transition hover:bg-status-primary hover:text-status-primary-foreground focus:bg-status-primary focus:text-status-primary-foreground focus:outline-none"
				type="button"
				onClick={() => onOpenChange(true)}
			>
				[i] status
			</button>
			{open && (
				<section
					aria-labelledby={titleId}
					className="fixed top-[calc(var(--spacing-status-bar)+0.75rem)] right-6 z-window w-[min(17rem,calc(100vw-3rem))] border-thin border-border bg-popover p-3 pt-4 text-popover-foreground text-tiny leading-4"
					id={panelId}
				>
					<h2
						className="absolute top-0 inset-s-1/2 z-raised -translate-1/2 border-x-thin border-border bg-popover px-2 text-primary leading-none"
						id={titleId}
					>
						STATUS
					</h2>
					<button
						aria-label="Close status box"
						className="absolute top-0 end-2 z-raised -translate-y-1/2 bg-popover px-1 text-primary leading-none focus:text-accent-foreground focus:outline-none"
						type="button"
						onClick={() => onOpenChange(false)}
					>
						<span aria-hidden="true" className="flex items-center">
							[<CloseIcon className="size-3" />]
						</span>
					</button>

					<div className="grid gap-2">
						<p className="flex items-center gap-2">
							<GlobeIcon
								aria-hidden="true"
								className="size-3 shrink-0 text-muted-foreground"
								data-testid="location-icon"
							/>
							Bussy-en-Othe, France
						</p>

						<div aria-live="polite">{renderWeather(weather)}</div>

						<p className="flex items-center gap-2 lowercase">
							<PaletteIcon aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" />
							{resolvedMode} / {themeLabels[activeTheme]}
						</p>

						<p className="flex items-center gap-2 text-primary">
							<CheckIcon aria-hidden="true" className="size-3 shrink-0" />
							Available for work
						</p>

						<section className="border-border border-t-thin pt-2">
							<h3 className="mb-1 flex items-center gap-2 text-muted-foreground">
								<TerminalIcon aria-hidden="true" className="size-3 shrink-0" />
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
				</section>
			)}
		</>
	);
}

function renderWeather(weather: WeatherData | null) {
	if (!weather) {
		return (
			<p className="flex items-center gap-2">
				<CloudIcon aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" />
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

function weatherDetails(code: number): { Icon: IconComponent; label: string } {
	if (code === 0) return { Icon: SunIcon, label: "Clear" };
	if (code <= 2) return { Icon: CloudSunIcon, label: "Partly cloudy" };
	if (code === 3) return { Icon: CloudIcon, label: "Overcast" };
	if (code === 45 || code === 48) return { Icon: CloudFogIcon, label: "Fog" };
	if (code >= 51 && code <= 57) return { Icon: CloudDrizzleIcon, label: "Drizzle" };
	if (code >= 61 && code <= 67) return { Icon: CloudRainIcon, label: "Rain" };
	if (code >= 71 && code <= 77) return { Icon: SnowflakeIcon, label: "Snow" };
	if (code >= 80 && code <= 82) return { Icon: CloudRainIcon, label: "Rain showers" };
	if (code === 85 || code === 86) return { Icon: SnowflakeIcon, label: "Snow showers" };
	if (code >= 95) return { Icon: CloudLightningIcon, label: "Thunderstorm" };
	return { Icon: CloudIcon, label: "Unknown conditions" };
}

function fluctuate(value: number, range: number) {
	const change = Math.floor(Math.random() * (range * 2 + 1)) - range;
	return Math.min(99, Math.max(1, value + change));
}
