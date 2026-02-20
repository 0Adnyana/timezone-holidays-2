import { Router } from "express";
import { getLocationInfo } from "../services/getLocationInfo";
import { getLocationHoliday } from "../services/getLocationHoliday";
import { getTimezoneInfo, type TimezoneInfo } from "../helpers/getTimezoneInfo";

export interface PlacesInfo {
	timezoneId: string;
	administrativeAreaLevel2?: string;
	administrativeAreaLevel1?: string;
	country: string;
	countryCode: string;
}

const router = Router();

router.get("/current-info", async (req, res) => {
	try {
		const searchText: string = req.query.searchText as string;

		if (!searchText) {
			return res.status(400).json({ error: "Query parameter 'searchText' is required" });
		}

		const placesInfo: PlacesInfo = await getLocationInfo(searchText);
		const timezoneInfo: TimezoneInfo = await getTimezoneInfo(placesInfo.timezoneId);

		const currentDate = new Date(Date.UTC(timezoneInfo.currentDate.year, timezoneInfo.currentDate.month - 1, timezoneInfo.currentDate.day));

		// const independenceDayTest = new Date(Date.UTC(2026, 7, 17)); // Mock: 17 Aug 2025
		console.log(placesInfo.countryCode);
		const holidayInfo = await getLocationHoliday(currentDate, placesInfo.countryCode);

		const result = {
			...placesInfo,
			...timezoneInfo,
			...holidayInfo,
		};

		res.json(result);
	} catch (e) {
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
