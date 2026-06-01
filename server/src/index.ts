import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import publicationsRouter from "./routes/publications";
import recommendationsRouter from "./routes/recommendations";
import authRouter from "./routes/auth";
import activityRouter from "./routes/activity";
import { driver } from "./db";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/publications", publicationsRouter);
app.use("/api/recommendations", recommendationsRouter);
app.use("/api/auth", authRouter);
app.use("/api/activity", activityRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

process.on("SIGINT", async () => {
  await driver.close();
  process.exit(0);
});
