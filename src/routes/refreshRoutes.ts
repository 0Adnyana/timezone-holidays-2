import { Router } from "express";
import { refreshCalendarData } from "../services/refreshCalendarData";

const router = Router();

router.get("/calendar", async (req, res) => {
	try {
		const result = await refreshCalendarData();

		res.json(result);
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
