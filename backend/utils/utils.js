import crypto from "crypto";
import dotenv from "dotenv";
import User from "../Model/user.js";

dotenv.config();

const MASTER_KEY = process.env.MS_ENCRYPTION_KEY;
const ALGORITHM = "aes-256-cbc";

export const generateUserEncryptionKey = () => {
  return crypto.randomBytes(32);
};

export const encryptWithMasterKey = (bufferKey) => {
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

export const decryptWithMasterKey = (encryptedText) => {
  const [ivHex, encryptedData] = encryptedText.split(":");
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(MASTER_KEY),
    Buffer.from(ivHex, "hex"),
  );

  let decrypted = decipher.update(Buffer.from(encryptedData, "hex"));

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted;
};

export const encryptTaskText = (text, userKey) => {
  if (!text) return text;

  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(userKey), iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
};

export const decryptTaskText = (encryptedText, userKey) => {
  if (!encryptedText) return encryptedText;

  try {
    const [ivHex, encryptedData] = encryptedText.split(":");

    if (!ivHex || !encryptedData) {
      throw new Error("Invalid encrypted task format");
    }

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      userKey, // Buffer from decryptWithMasterKey()
      Buffer.from(ivHex, "hex"),
    );

    let decrypted = decipher.update(Buffer.from(encryptedData, "hex"));

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf8");
  } catch (error) {
    console.error("Task decryption failed:", error.message);
    return encryptedText; // optional fallback
  }
};

export const getRawUserKey = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.encKey) {
    throw new Error("User encryption key not found");
  }
  const rawUserKey = decryptWithMasterKey(user.encKey);
  return rawUserKey;
};
