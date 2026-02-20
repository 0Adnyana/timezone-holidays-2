import { createIntlParser } from "./dateUtils";

export interface TimezoneInfo {
	currentUTCOffsetInMinutes: number;
	currentTime: { hour: number; minute: number };
	currentDate: { year: number; month: number; day: number };
	timeOfDay: "morning" | "afternoon" | "evening" | "night";
}

/**
 * Gets timezone information for a given IANA timezone ID.
 * Uses the built-in Intl API which handles daylight saving automatically.
 *
 * @param timezoneId - IANA timezone identifier (e.g., "America/Los_Angeles", "Asia/Tokyo")
 * @returns TimezoneInfo object with UTC offset (including DST), current time, and current date
 */
export function getTimezoneInfo(timezoneId: string): TimezoneInfo {
	const now = new Date();
	const currentUTCOffsetInMinutes = getUTCOffsetInMinutes(timezoneId, now);

	const parse = createIntlParser(
		timezoneId,
		{ year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hour12: false },
		["year", "month", "day", "hour", "minute"],
	);
	const { hour, minute, year, month, day } = parse(now);

	const currentTime = { hour, minute };
	const currentDate = { year, month, day };
	const timeOfDay = getTimeOfDay(hour);

	return { currentUTCOffsetInMinutes, currentTime, currentDate, timeOfDay };
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

/**
 * Calculates the UTC offset in minutes for a given timezone.
 * Positive values indicate ahead of UTC, negative values indicate behind UTC.
 */
function getUTCOffsetInMinutes(timezoneId: string, date: Date): number {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: timezoneId,
		timeZoneName: "shortOffset",
	}).formatToParts(date);

	const offsetString = parts.find((p) => p.type === "timeZoneName")?.value;

	if (!offsetString) {
		throw new Error(`Unable to get offset for timezone: ${timezoneId}`);
	}

	if (offsetString === "GMT" || offsetString === "UTC") {
		return 0;
	}

	const match = offsetString.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
	if (!match) {
		throw new Error(`Unable to parse offset string: ${offsetString}`);
	}

	const sign = match[1] === "+" ? 1 : -1;
	const hours = parseInt(match[2]!, 10);
	const minutes = match[3] ? parseInt(match[3], 10) : 0;

	return sign * (hours * 60 + minutes);
}
