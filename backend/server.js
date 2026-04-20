import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import Task from "./Model/task.js";
import { userRoute } from "./routes/user.js";
import { taskRoute } from "./routes/task.js";
import { authenticate } from "./middleware/protected.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
mongoose.connect(process.env.DB);

// HEALTH API
app.get("/api/health", (req, res, next) => {
  res.json({ status: "ok" });
});

// CONSOLE LOGGING
app.use((req, res, next) => {
  res.on("finish", () => {
    const now = new Date().toISOString();
    console.log(`[${now}] ${req.method} ${req.url} ${res.statusCode}`);
  });
  next();
});

// MAIN ROUTES
app.use("/api/user", userRoute);
app.use("/api/task", authenticate, taskRoute);

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || 400;
  res.status(status).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
