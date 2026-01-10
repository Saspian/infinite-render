import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import mongoose from 'mongoose';

dotenv.config();
const app = express();
const PORT = process.env.PORT;

import Task from "./Model/task.js";

app.use(cors());
app.use(express.json());
mongoose.connect(process.env.DB)

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/tasks", async (req, res) => {
  const tasks = await Task.find();
  return res.json({status: "success", data: tasks})
})

app.post("/task", async (req, res) => {
  const task = await Task.create({
      text: "Sometext format", 
      completed: false, 
      dueDate: '02.07.2026', 
      isDeleted: false,  
      deletedAt: false 
  })
  res.json({status: "success", data: task})
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;