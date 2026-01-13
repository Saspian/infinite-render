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
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { sort = "createdAt", order = "desc" } = req.query;
    const tasks = await Task.find().sort({ [sort]: order === "asc" ? 1 : -1 });
    return res.json({status: "success", data: tasks})
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
})

app.post("/task", async (req, res) => {
  const { text, _id } = req.body;
  const d = new Date();
  const dueDate = d.setDate(d.getDate() + 10);
  const task = await Task.create({
      _id,
      text, 
      completed: false, 
      dueDate, 
      isDeleted: false,  
      deletedAt: null 
  })
  res.json({status: "success", data: task})
})

app.put("/complete/task/:id", async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { completed: true }},
    { new: true }
  )
  res.json({status: "success", data: task})
})

app.put("/edit/task/:id", async (req, res) => {
  const { text } = req.body;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { text }},
    { new: true }
  )
  res.json({status: "success", data: task})
})

app.delete("/task/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(
      { _id: req.params.id },
    )
    if(!task) {
      throw new Error("Task not found")
    }
    res.json({status: "success", data: "Deleted successfully"})
  } catch (err) {
    res.status(500).json(err);
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;