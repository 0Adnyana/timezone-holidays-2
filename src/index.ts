import "dotenv/config";
import express from "express";
import Redis from "ioredis";
import locationRoutes from "./routes/locationRoutes";
import refreshRoutes from "./routes/refreshRoutes";

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

app.use("/api/refresh", refreshRoutes);

app.use("/api/location", locationRoutes);

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
