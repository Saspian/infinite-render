import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

import Task from "./Model/task.js";

app.use(cors());
app.use(express.json());
mongoose.connect(process.env.DB);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url}`);
  next(); 
});

app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ order: 1 });
    return res.json({ status: "success", data: tasks });
  } catch (err) {
    res.status(400).json({ err });
  }
});

app.post("/task", async (req, res) => {
  try {
    const { text, order, _id } = req.body;
    const d = new Date();
    const dueDate = d.setDate(d.getDate() + 10);
    const task = await Task.create({
      _id,
      text,
      order,
      priority: "low",
      completed: false,
      dueDate,
      isDeleted: false,
      deletedAt: null,
    });
    res.json({ status: "success", data: task });
  } catch (err) {
    res.status(400).json({ err });
  }
});

app.put("/complete/task/:id", async (req, res) => {
  try {
    const { completed } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { completed } },
      { new: true },
    );
    res.json({ status: "success", data: task });
  } catch (err) {
    res.status(400).json({ err });
  }
});

app.put("/edit/task/:id", async (req, res) => {
  const { text } = req.body;
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { text } },
      { new: true },
    );
    res.json({ status: "success", data: task });
  } catch (err) {
    res.status(400).json({ err });
  }
});

app.patch("/tasks/reorder", async (req, res) => {
  const { tasks } = req.body;
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ message: "Tasks array is required" });
  }
  try {
    const operations = tasks.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order } },
      },
    }));
    await Task.bulkWrite(operations, { ordered: false });
    res.json({ status: "success", data: "Reordered successfully" });
  } catch (err) {
    res.status(400).json({ err });
  }
});

app.put("/task/priority/:id", async (req, res) => {
  try {
    const { priority } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { priority: priority } },
      { new: true },
    );
    res.json({ status: "success", data: task });
  } catch (err) {
    res.status(400).json({ err });
  }
});

app.delete("/task/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete({ _id: req.params.id });
    if (!task) {
      throw new Error("Task not found");
    }
    res.json({ status: "success", data: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ err });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
