import type { TimezoneInfo } from "./getTimezoneInfo";

/**
 * Creates a Date from 1-indexed year/month/day components in UTC.
 * Handles the 0-indexed month conversion that Date.UTC requires.
 */
export function toUTCDate(year: number, month: number, day: number): Date {
	return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Creates a reusable Intl.DateTimeFormat parser that extracts the specified
 * numeric parts from formatted output. The formatter is created once and reused.
 */
export function createIntlParser<K extends string>(timezoneId: string, options: Intl.DateTimeFormatOptions, keys: K[]) {
	const formatter = new Intl.DateTimeFormat("en-US", { timeZone: timezoneId, ...options });
	return (date: Date): Record<K, number> => {
		const parts = formatter.formatToParts(date);
		const result = {} as Record<K, number>;
		for (const key of keys) {
			result[key] = parseInt(parts.find((p) => p.type === key)!.value, 10);
		}
		return result;
	};
}

export function getTimeOfDay(currentHour: TimezoneInfo["currentTime"]["hour"]): TimezoneInfo["timeOfDay"] {
	switch (true) {
		case currentHour >= 6 && currentHour < 12:
			return "morning";
		case currentHour >= 12 && currentHour < 18:
			return "afternoon";
		case currentHour >= 18 && currentHour < 21:
			return "evening";
		default:
			return "night";
	}
}
