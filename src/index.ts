import express from "express";
import prisma from "./lib/prisma";
import Redis from "ioredis";

const app = express();
const PORT = process.env.PORT || 3000;
const redis = new Redis();

app.use(express.json());

app.get("/", async (req, res) => {
	const result = "welcome :)";
	res.json(result);
});

app.get("/test", async (req, res) => {
	const result = "works!";
	res.json(result);
});

app.get("/api/location/current-info/:textQuery", async (req, res) => {
	// validate data
	const textQuery: String = req.params.textQuery;

	const googlePlacesResponse = await fetch(`https://places.googleapis.com/v1/places:searchText`, {
		headers: {
			"Content-Type": "application/json",
			"X-Goog-Api-Key": process.env.MAPS_API_KEY,
			"X-Goog-FieldMask": "",
		},
		body: JSON.stringify({
			textQuery: textQuery,
			pageSize: 1,
			includedType: "administrative_area_level_1",
		}),
	});

	const googlePlacesData = (await googlePlacesResponse).json();
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
