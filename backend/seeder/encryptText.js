import mongoose from "mongoose";
import dotenv from "dotenv";
import Task from "../Model/task.js";
import User from "../Model/user.js"
import crypto from "crypto";
dotenv.config();

const DB_URL = process.env.DB;

const MASTER_KEY = process.env.MS_ENCRYPTION_KEY;
const ALGORITHM = "aes-256-cbc";

// Must be exactly 32 chars for aes-256-cbc
if (!MASTER_KEY || MASTER_KEY.length !== 32) {
  throw new Error(
    "MS_ENCRYPTION_KEY must exist in .env and be exactly 32 characters long"
  );
}

// Generate random 32-char user key
const generateUserEncryptionKey = () => {
  return crypto.randomBytes(32);
};

// Encrypt user key using MASTER KEY before storing in DB
const encryptWithMasterKey = (bufferKey) => {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(MASTER_KEY),
    iv
  );

  let encrypted = cipher.update(bufferKey);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

// Decrypt stored user key using MASTER KEY
const decryptWithMasterKey = (encryptedText) => {
  const [ivHex, encryptedData] = encryptedText.split(":");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(MASTER_KEY),
    Buffer.from(ivHex, "hex")
  );

  let decrypted = decipher.update(
    Buffer.from(encryptedData, "hex")
  );

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted;
};

// Encrypt task text using USER KEY
const encryptTaskText = (text, userKey) => {
  if (!text) return text;

  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(userKey),
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
};

// Prevent double encryption
const isAlreadyEncrypted = (value) => {
  if (!value) return false;

  return value.includes(":") && value.split(":")[0].length === 32;
};

// ======================================================
// MAIN SEEDER
// ======================================================

const runSeeder = async () => {
  try {
    await mongoose.connect(DB_URL);

    console.log("MongoDB connected");

    // --------------------------------------------------
    // STEP 1: Create encrypted encKey for each user
    // --------------------------------------------------

    const users = await User.find({});

    console.log(`Found ${users.length} users`);

    for (const user of users) {
      // Skip if already has encKey
      if (user.encKey) {
        console.log(`Skipping user ${user._id} (encKey already exists)`);
        continue;
      }

      const rawUserKey = generateUserEncryptionKey();
      const encryptedUserKey = encryptWithMasterKey(rawUserKey);

      user.encKey = encryptedUserKey;
      await user.save();

      console.log(`Created encKey for user: ${user._id}`);
    }

    // --------------------------------------------------
    // STEP 2: Encrypt tasks.text using each user's key
    // --------------------------------------------------

    const tasks = await Task.find({});

    console.log(`Found ${tasks.length} tasks`);

    let updatedTasks = 0;

    for (const task of tasks) {
      if (!task.text) continue;

      if (isAlreadyEncrypted(task.text)) {
        console.log(`Skipping task ${task._id} (already encrypted)`);
        continue;
      }

      if (!task.userId) {
        console.log(`Skipping task ${task._id} (no user linked)`);
        continue;
      }

      const user = await User.findOne({ _id: task.userId });
      console.log("Key length: ",user.encKey.length)

      if (!user || !user.encKey) {
        console.log(`Skipping task ${task._id} (user/encKey missing)`);
        continue;
      }

      const rawUserKey = decryptWithMasterKey(user.encKey);

      task.text = encryptTaskText(task.text, rawUserKey);
      await task.save();

      updatedTasks++;

      console.log(`Encrypted task ${task._id}`);
    }

    console.log(`Seeder completed. Updated ${updatedTasks} tasks`);

    process.exit(0);
  } catch (error) {
    console.error("Seeder failed:", error);
    process.exit(1);
  }
};

runSeeder();