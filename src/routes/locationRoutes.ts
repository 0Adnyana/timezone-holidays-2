import { Router } from "express";
import { getLocationInfo } from "../services/getLocationInfo";

const router = Router();

router.get("/current-info", async (req, res) => {
	// validate data
	try {
		const searchText: string = req.query.searchText as string;

		if (!searchText) {
			return res.status(400).json({ error: "Query parameter 'searchText' is required" });
		}

		const result = await getLocationInfo(searchText);
		res.json(result);
	} catch (e) {
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
