import { Router } from "express";
import { getLocationInfo } from "../services/getLocationInfo";

const router = Router();

router.get("/current-info", async (req, res) => {
	// validate data
	const searchText: string = req.query.searchText as string;

	if (!searchText) {
		return res.status(400).json({ error: "Query parameter 'q' is required" });
	}

	const result = await getLocationInfo(searchText);
	res.json(result);
	// console.log(JSON.stringify(googlePlacesData, null, 2));
});

export default router;
