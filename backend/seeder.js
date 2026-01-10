import mongoose from "mongoose";
import dotenv from "dotenv";
import Task from "./Model/task.js";
import { Tasks } from "./Tasks.js";
dotenv.config();


const DB_URL = process.env.DB;

const tasks = Tasks;

const seedDB = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log("DB connected");
    await Task.insertMany(tasks);
    console.log("Database seeded!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();