import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

const WEATHER_URL =
	"https://api.open-meteo.com/v1/forecast?latitude=48.01942&longitude=3.51372&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=Europe%2FParis";

const WeatherResponse = v.object({
	current: v.object({
		temperature_2m: v.number(),
		weather_code: v.number(),
	}),
});

export type WeatherData = {
	temperature: number;
	weatherCode: number;
};

export const getCurrentWeather = createServerFn({ method: "GET" }).handler(
	async (): Promise<WeatherData | null> => {
		try {
			const response = await fetch(WEATHER_URL);
			if (!response.ok) return null;

			const result = v.safeParse(WeatherResponse, await response.json());
			if (!result.success) return null;

			return {
				temperature: result.output.current.temperature_2m,
				weatherCode: result.output.current.weather_code,
			};
		} catch {
			return null;
		}
	},
);
