import prisma from "../lib/prisma";
import { EventStatus } from "../../generated/prisma/enums";

const googleApiKey = process.env.GOOGLE_API_KEY!;

export async function refreshCalendarData() {
	const calendars = await prisma.googleHolidayCalendar.findMany();
	const year = new Date().getFullYear();

	for (const calendar of calendars) {
		let response: Response;

		console.log(`Fetching data for calendar: ${calendar.calendarName}`);

		if (calendar.nextSyncToken) {
			// sync with token

			response = await fetch(
				`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.calendarUrl)}/events?key=${googleApiKey}&syncToken=${calendar.nextSyncToken}`,
			);

			// If sync token expired, full fetch
			if (response.status === 410) {
				response = await fetch(
					`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.calendarUrl)}/events?key=${googleApiKey}&timeMin=${year}-01-01T00:00:00Z&timeMax=${year + 1}-12-31T23:59:59Z`,
				);
			}

			if (!response.ok) {
				throw new Error(`Google Calendar API error: ${response.status}`);
			}

			const responseJSON: any = await response.json();

			const nextSyncToken = responseJSON.nextSyncToken;
			const events = responseJSON.items;

			await prisma.$transaction([
				...events.map((event: any) => {
					const status = checkForTentativeHolidays(event);
					return prisma.googleHolidayEvent.upsert({
						where: {
							googleId: event.id,
						},
						update: {
							holidayName: event.summary,
							status: status,
							startDate: new Date(event.start.date),
							endDate: new Date(event.end.date),
						},
						create: {
							calendarId: calendar.id,
							googleId: event.id,
							holidayName: event.summary,
							status: status,
							startDate: new Date(event.start.date),
							endDate: new Date(event.end.date),
						},
					});
				}),
				prisma.googleHolidayCalendar.update({
					where: { id: calendar.id },
					data: {
						nextSyncToken: nextSyncToken,
						lastUpdated: new Date(),
					},
				}),
			]);
		} else {
			// First run, full fetch with timeMin and timeMax
			response = await fetch(
				`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.calendarUrl)}/events?key=${googleApiKey}&timeMin=${year}-01-01T00:00:00Z&timeMax=${year + 1}-12-31T23:59:59Z`,
			);

			if (!response.ok) {
				throw new Error(`Google Calendar API error: ${response.status}`);
			}

			const responseJSON: any = await response.json();
			const nextSyncToken = responseJSON.nextSyncToken;
			const events = responseJSON.items;

			await prisma.$transaction([
				prisma.googleHolidayEvent.createMany({
					data: events.map((event: any) => {
						const status = checkForTentativeHolidays(event);

						return {
							calendarId: calendar.id,
							googleId: event.id,
							holidayName: event.summary,
							status: status,
							startDate: new Date(event.start.date),
							endDate: new Date(event.end.date),
						};
					}),
					skipDuplicates: true,
				}),
				prisma.googleHolidayCalendar.update({
					where: { id: calendar.id },
					data: {
						nextSyncToken: nextSyncToken,
						lastUpdated: new Date(),
					},
				}),
			]);
		}
	}

	return { message: "successfuly refreshed data" };
}

function checkForTentativeHolidays(event: any) {
	if (event.status == "confirmed") {
		if (event.description?.toLowerCase().includes("tentative")) {
			return EventStatus.TENTATIVE;
		} else {
			return EventStatus.CONFIRMED;
		}
	} else {
		return EventStatus.CANCELLED;
	}
}
