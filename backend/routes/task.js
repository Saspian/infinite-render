import express from "express";
import Task from "../Model/task.js";

const router = express.Router()

router.get("/", async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ order: 1 });
    return res.json({ status: "success", data: tasks });
  } catch (err) {
    next(err)
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { text, order, _id } = req.body;
    const d = new Date();
    const dueDate = d.setDate(d.getDate() + 10);
    const task = await Task.create({
      _id,
      userId: req.user._id,
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
    next(err)
  }
});

router.put("/complete/:id", async (req, res, next) => {
  try {
    const { completed, order } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { completed, order } },
      { new: true },
    );
    res.json({ status: "success", data: task });
  } catch (err) {
    next(err)
  }
});

router.put("/edit/:id", async (req, res, next) => {
  const { text } = req.body;
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { text } },
      { new: true },
    );
    res.json({ status: "success", data: task });
  } catch (err) {
    next(err)
  }
});

router.patch("/reorder", async (req, res, next) => {
  const { tasks } = req.body;
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return next(err)
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
    next(err)
  }
});

router.put("/priority/:id", async (req, res, next) => {
  try {
    const { priority } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { priority: priority } },
      { new: true },
    );
    res.json({ status: "success", data: task });
  } catch (err) {
    next(err)
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete({ _id: req.params.id });
    if (!task) {
      throw new Error("Task not found");
    }
    res.json({ status: "success", data: "Deleted successfully" });
  } catch (err) {
    next(err)
  }
});

export { router as taskRoute};