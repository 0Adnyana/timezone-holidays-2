import { getTimezoneInfo } from "../helpers/getTimezoneInfo";

type TimeOfDay = "Morning" | "Afternoon" | "Evening" | "Night";

interface HourInfo {
	time: { hour: number; minute: number };
	timeOfDay: TimeOfDay;
	isHoliday: boolean;
	holidayName: string;
	date: { year: number; month: number; day: number };
	isWorkHour: boolean;
}

interface NextHoursResult {
	nextHours: HourInfo[];
}

/**
 * Gets the next 24 hours information for a given timezone.
 * Times are rounded to the next hour but preserve the timezone's minute offset.
 * For example, Nepal (UTC+5:45) at 11:33 would have next hour at 11:45.
 *
 * @param timezoneId - IANA timezone identifier (e.g., "America/Los_Angeles", "Asia/Kathmandu")
 * @returns NextHoursResult object with array of 24 HourInfo objects
 */
export function getNextHours(timezoneId: string): NextHoursResult {
	const tzInfo = getTimezoneInfo(timezoneId);
	const offsetMinutes = tzInfo.currentUTCOffsetInMinutes;

	// Calculate the minute component from the offset (e.g., 45 for Nepal, 30 for India, 0 for most)
	const offsetMinuteComponent = Math.abs(offsetMinutes) % 60;

	// Get current time in the timezone
	const { hour: currentHour, minute: currentMinute } = tzInfo.currentTime;

	// Calculate the next rounded hour
	// If current minute is past the offset minute component, we're in the next "hour block"
	let nextHour: number;
	let baseMinute: number;

	if (offsetMinuteComponent === 0) {
		// Standard timezone (offset is whole hours)
		nextHour = (currentHour + 1) % 24;
		baseMinute = 0;
	} else {
		// Non-standard timezone (has minute component like :30 or :45)
		baseMinute = offsetMinuteComponent;

		if (currentMinute >= offsetMinuteComponent) {
			// We've passed the :XX mark, next hour block starts at next hour :XX
			nextHour = (currentHour + 1) % 24;
		} else {
			// We haven't reached the :XX mark yet, next hour block is current hour :XX
			nextHour = currentHour;
		}
	}

	// Build the base Date object for calculations
	const now = new Date();
	const utcNow = now.getTime();

	// Calculate the timestamp for the next rounded hour in UTC
	const currentDateInTz = tzInfo.currentDate;
	const nextHourDate = new Date(
		Date.UTC(
			currentDateInTz.year,
			currentDateInTz.month - 1, // JS months are 0-indexed
			currentDateInTz.day,
			nextHour,
			baseMinute,
			0,
			0,
		),
	);

	// Adjust for timezone offset to get actual UTC time
	const nextHourUTC = nextHourDate.getTime() - offsetMinutes * 60 * 1000;

	// If the calculated time is in the past, add a day
	let startTimestamp = nextHourUTC;
	if (startTimestamp <= utcNow) {
		startTimestamp += 24 * 60 * 60 * 1000;
	}

	const nextHours: HourInfo[] = [];

	for (let i = 0; i < 24; i++) {
		const hourTimestamp = startTimestamp + i * 60 * 60 * 1000;
		const hourDate = new Date(hourTimestamp);

		// Get time and date in the target timezone
		const time = getTimeInTimezone(timezoneId, hourDate);
		const date = getDateInTimezone(timezoneId, hourDate);
		const timeOfDay = categorizeTimeOfDay(time.hour);
		const isWorkHour = checkIsWorkHour(time.hour, time.minute);

		nextHours.push({
			time,
			timeOfDay,
			isHoliday: false, // TODO: Fetch holiday data from Google Calendar API or database
			holidayName: "", // TODO: Fetch holiday name from Google Calendar API or database
			date,
			isWorkHour,
		});
	}

	return { nextHours };
}

/**
 * Gets time in a specific timezone from a Date object.
 */
function getTimeInTimezone(timezoneId: string, date: Date): { hour: number; minute: number } {
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
 * Gets date in a specific timezone from a Date object.
 */
function getDateInTimezone(timezoneId: string, date: Date): { year: number; month: number; day: number } {
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

/**
 * Categorizes hour into time of day.
 * Morning: 6:00 - 11:59
 * Afternoon: 12:00 - 17:59
 * Evening: 18:00 - 20:59
 * Night: 21:00 - 5:59
 */
function categorizeTimeOfDay(hour: number): TimeOfDay {
	if (hour >= 6 && hour < 12) {
		return "Morning";
	} else if (hour >= 12 && hour < 18) {
		return "Afternoon";
	} else if (hour >= 18 && hour < 21) {
		return "Evening";
	} else {
		return "Night";
	}
}

/**
 * Checks if the given time falls within normal work hours.
 * Work hours are defined as 9:00 - 17:00 (9 AM - 5 PM).
 * For non-standard timezones, we compare based on hour boundaries.
 */
function checkIsWorkHour(hour: number, minute: number): boolean {
	// Work hours: 9:00 to 17:00 (exclusive of 17:00)
	// A time is a work hour if it's >= 9:00 and < 17:00
	const timeInMinutes = hour * 60 + minute;
	const workStartMinutes = 9 * 60; // 9:00
	const workEndMinutes = 17 * 60; // 17:00

	return timeInMinutes >= workStartMinutes && timeInMinutes < workEndMinutes;
}
