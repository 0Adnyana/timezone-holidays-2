import { getTimezoneInfo } from "../helpers/getTimezoneInfo";
import { createIntlParser, getTimeOfDay, toUTCDate } from "../helpers/dateUtils";
import { getLocationHoliday, type HolidayInfo } from "./getLocationHoliday";

interface HourInfo {
	time: { hour: number; minute: number };
	timeOfDay: string;
	isHoliday: boolean;
	holidays: HolidayInfo["holidays"];
	date: { year: number; month: number; day: number };
}

/**
 * Returns the next 24 hours of info for a timezone, rounded to the next hour boundary.
 * Non-standard offsets (e.g. Nepal UTC+5:45) snap to their minute component.
 */
export async function getNextHours(timezoneId: string, countryCode: string, hourReturnCount: number): Promise<{ nextHours: HourInfo[] }> {
	const startTimestamp = getNextHourBoundary(timezoneId);
	const parsedHours = parseLocalHours(timezoneId, startTimestamp, hourReturnCount);
	const holidaysByDate = await getHolidaysByDate(parsedHours, countryCode);

	const nextHours: HourInfo[] = parsedHours.map((entry) => {
		const dateKey = `${entry.year}-${entry.month}-${entry.day}`;
		const holiday = holidaysByDate.get(dateKey)!;
		return {
			time: { hour: entry.hour, minute: entry.minute },
			timeOfDay: getTimeOfDay(entry.hour),
			isHoliday: holiday.isHoliday,
			holidays: holiday.holidays,
			date: { year: entry.year, month: entry.month, day: entry.day },
		};
	});

	return { nextHours };
}

interface ParsedHour {
	hour: number;
	minute: number;
	year: number;
	month: number;
	day: number;
}

function getNextHourBoundary(timezoneId: string): number {
	const { currentUTCOffsetInMinutes, currentTime, currentDate } = getTimezoneInfo(timezoneId);

	// gets the minute offset (0, 30, 45)
	const offsetMinuteComponent = Math.abs(currentUTCOffsetInMinutes) % 60;

	let nextHour: number;
	let baseMinute: number;

	if (offsetMinuteComponent === 0) {
		nextHour = (currentTime.hour + 1) % 24;
		baseMinute = 0;
	} else {
		baseMinute = offsetMinuteComponent;

		// if current minute is >= the offset (50 > 30) then round the hour up, else just round down the hour
		// this is specifically for non standard minute offset (like India and Nepal)
		nextHour = currentTime.minute >= offsetMinuteComponent ? (currentTime.hour + 1) % 24 : currentTime.hour;
	}

	const { year, month, day } = currentDate;
	const nextHourUTC = Date.UTC(year, month - 1, day, nextHour, baseMinute) - currentUTCOffsetInMinutes * 60_000;

	// returns utc instant of the time. converts local time to UTC
	return nextHourUTC <= Date.now() ? nextHourUTC + 86_400_000 : nextHourUTC;
}

function parseLocalHours(timezoneId: string, startTimestamp: number, hourReturnCount: number): ParsedHour[] {
	const parse = createIntlParser(
		timezoneId,
		{ year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false },
		["year", "month", "day", "hour", "minute"],
	);

	// creates an array with the length of 24 and adds an hour each iteration, does take into account daylight savings using the Intl parser.
	// note, since it loops the UTC hour and not Local time, on timezones with daylight savings there will be a day where there's a duplication time and another where it skips by two hours. This is intended.
	return Array.from({ length: hourReturnCount }, (_, i) => {
		const { hour, minute, year, month, day } = parse(new Date(startTimestamp + i * 3_600_000));
		return { hour: hour % 24, minute, year, month, day };
	});
}

async function getHolidaysByDate(hours: ParsedHour[], countryCode: string) {
	const uniqueDates = new Map<string, ParsedHour>();
	for (const h of hours) {
		const key = `${h.year}-${h.month}-${h.day}`;
		if (!uniqueDates.has(key)) uniqueDates.set(key, h);
	}

	const entries = [...uniqueDates.entries()];
	const results = await Promise.all(entries.map(([, { year, month, day }]) => getLocationHoliday(toUTCDate(year, month, day), countryCode)));

	return new Map(entries.map(([key], i) => [key, results[i]!]));
}
