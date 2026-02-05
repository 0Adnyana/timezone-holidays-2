import { createGoogleHolidayCalendars } from "./googleHolidayCalendars";
import prisma from "../../src/lib/prisma";

// run seed with 'npx prisma db seed'

createGoogleHolidayCalendars()
	.then(async () => {
		console.log("Google Holiday Calendars Seeded");
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error("Seed Error: ", e);

		await prisma.$disconnect();

		process.exit(1);
	});
