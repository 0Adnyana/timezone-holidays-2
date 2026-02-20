export interface HolidayInfo {
	isHoliday: boolean;
	holidays: {
		holidayName: string;
		holidayStatus: string;
	}[];
}

import prisma from "../lib/prisma";

export async function getLocationHoliday(date: Date, countryCode: string): Promise<HolidayInfo> {
	const response = await prisma.googleHolidayEvent.findMany({
		where: {
			calendar: {
				countryCode: countryCode,
			},
			startDate: {
				lte: date,
			},
			endDate: {
				gt: date,
			},
			OR: [{ status: "CONFIRMED" }, { status: "TENTATIVE" }],
		},
	});

	const holidays = response.map((holiday) => ({
		holidayName: holiday.holidayName,
		holidayStatus: holiday.status,
	}));

	return {
		isHoliday: holidays.length > 0,
		holidays,
	};

	// let holidayInfo: HolidayInfo;
	// if (response.length == 0) {
	// 	holidayInfo = {
	// 		isHoliday: false,
	// 		holidays: [],
	// 	};
	// } else {
	// 	holidayInfo = {
	// 		isHoliday: true,
	// 		holidays: response.map((holiday) => {
	// 			return {
	// 				holidayName: holiday.holidayName,
	// 				holidayStatus: holiday.status,
	// 			};
	// 		}),
	// 	};
	// }

	// return holidayInfo;
}
