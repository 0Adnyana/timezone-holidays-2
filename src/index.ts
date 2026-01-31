import express from "express";
import prisma from "./lib/prisma";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", async (req, res) => {
	const result = "welcome :)";
	res.json(result);
});

app.get("/test", async (req, res) => {
	const result = "works!";
	res.json(result);
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
