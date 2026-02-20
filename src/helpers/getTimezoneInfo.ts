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

	// Get the offset in minutes (including DST)
	const currentUTCOffsetInMinutes = getUTCOffsetInMinutes(timezoneId, now);

	// Get current time in the specified timezone
	const currentTime = getCurrentTime(timezoneId, now);

	// Get current date in the specified timezone
	const currentDate = getCurrentDate(timezoneId, now);

	// Determine time of day from current hour
	const timeOfDay = getTimeOfDay(currentTime);

	return {
		currentUTCOffsetInMinutes,
		currentTime,
		currentDate,
		timeOfDay,
	};
}

function getTimeOfDay(currentTime: TimezoneInfo["currentTime"]): TimezoneInfo["timeOfDay"] {
	switch (true) {
		case currentTime.hour >= 6 && currentTime.hour < 12:
			return "morning";
		case currentTime.hour >= 12 && currentTime.hour < 18:
			return "afternoon";
		case currentTime.hour >= 18 && currentTime.hour < 21:
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

	// Parse offset string like "GMT+5:30", "GMT-8", "GMT"
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

/**
 * Gets the current time in the specified timezone.
 */
function getCurrentTime(timezoneId: string, date: Date): { hour: number; minute: number } {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: timezoneId,
		hour: "numeric",
		minute: "numeric",
		hour12: false,
	}).formatToParts(date);

	const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
	const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);

	return { hour, minute };
}

/**
 * Gets the current date in the specified timezone.
 */
function getCurrentDate(timezoneId: string, date: Date): { year: number; month: number; day: number } {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: timezoneId,
		year: "numeric",
		month: "numeric",
		day: "numeric",
	}).formatToParts(date);

	const year = parseInt(parts.find((p) => p.type === "year")?.value ?? "0", 10);
	const month = parseInt(parts.find((p) => p.type === "month")?.value ?? "0", 10);
	const day = parseInt(parts.find((p) => p.type === "day")?.value ?? "0", 10);

	return { year, month, day };
}
