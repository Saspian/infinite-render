import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../Model/user.js"

dotenv.config();
const DB_URL = process.env.DB;

async function seedEncKeys() {
  try {
    // 1. Connect to your MongoDB
    await mongoose.connect(DB_URL);
    console.log("Connected to MongoDB...");

    // 2. Find users that don't have the encKey field yet
    const usersToUpdate = await User.find({ encKey: { $exists: false } });
    console.log(`Found ${usersToUpdate.length} users needing an encryption key.`);

    // 3. Update them (using a loop if you need unique keys per user)
    const updatePromises = usersToUpdate.map(user => {      
      return User.updateOne(
        { _id: user._id },
        { $set: { encKey: "" } }
      );
    });

    await Promise.all(updatePromises);

    console.log("Successfully updated all users.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

seedEncKeys();