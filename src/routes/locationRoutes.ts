import { Router } from "express";
import { getLocationInfo, type PlacesInfo } from "../services/getLocationInfo";
import { getLocationHoliday } from "../services/getLocationHoliday";
import { getTimezoneInfo, type TimezoneInfo } from "../helpers/getTimezoneInfo";
import { toUTCDate } from "../helpers/dateUtils";
import { getNextHours } from "../services/getNextHours";

const router = Router();

router.get("/current-info", async (req, res) => {
	try {
		const searchText: string = req.query.searchText as string;

		if (!searchText) {
			return res.status(400).json({ error: "Query parameter 'searchText' is required" });
		}

		const placesInfo: PlacesInfo = await getLocationInfo(searchText);
		const timezoneInfo: TimezoneInfo = getTimezoneInfo(placesInfo.timezoneId);

		const currentDate = toUTCDate(timezoneInfo.currentDate.year, timezoneInfo.currentDate.month, timezoneInfo.currentDate.day);

		console.log(placesInfo.countryCode);
		const holidayInfo = await getLocationHoliday(currentDate, placesInfo.countryCode);

		const result = {
			location: {
				...placesInfo,
			},
			...timezoneInfo,
			...holidayInfo,
		};

		res.json(result);
	} catch (e) {
		res.status(500).json({ error: "Internal server error" });
	}
});

router.get("/next-hours", async (req, res) => {
	try {
		const countryCode: string = req.query.countryCode as string;
		const timezoneId: string = req.query.timezoneId as string;

		if (!timezoneId || !countryCode) {
			return res.status(400).json({ error: "Query parameters 'timezoneId' and 'countryCode' are required" });
		}

		const response = await getNextHours(timezoneId, countryCode);

		res.json(response);
	} catch (e) {
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
