import prisma from "../../src/lib/prisma";
import { countryList } from "./countryList";

export async function createGoogleHolidayCalendars() {
	console.log("Seeding Google Holiday Calendars");
	const fillCountryList = await prisma.googleHolidayCalendar.createMany({
		data: countryList,
	});
}
