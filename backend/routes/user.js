
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../Model/user.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    // CHECKING DUPLICATION
    const userExist = await User.findOne({ username: req.body.username });
    if (userExist) {
      return res.status(400).send({ msg: "Username already exist" }).end();
    }

    // MATCHING PASSWORD AND REPASSWORD
    if (req.body.password !== req.body.repassword) {
      return res.status(400).send({ msg: "Password does not match" }).end();
    }

    // HASHING PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const hashedrePassword = await bcrypt.hash(req.body.repassword, salt);

    // CREATING NEW USER
    const user = new User({
      username: req.body.username.toLowerCase().trim(),
      password: hashedPassword,
      repassword: hashedrePassword,
    });
    const savedUser = await user.save();
    res
      .status(200)
      .send({ msg: "Account created successfully", user: user.username });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const userName = req.body.username.toLowerCase().trim();
    // req.body.username
    // CHECKING IF USER EMAIL EXIST
    const user = await User.findOne({ username: userName });
    if (!user) {
      return res.status(401).send({ msg: "Invalid username or password" });
    }
    // VALIDATING PASSWORD
    const validPsw = await bcrypt.compare(req.body.password, user.password);
    if (!validPsw) {
      return res.status(401).send({ msg: "Invalid username or password" });
    }
    // ASSIGNING TOKEN
    const accessToken = generateAccessToken({ _id: user._id });
    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      },
    );

    const dataToSend = {
      token: accessToken,
      refreshToken,
      username: user.username,
      id: user._id,
      message: "Login successfull",
    };

    res.cookie("session_token", accessToken, {
      httpOnly: true,
      secure: true, // Required for SameSite: 'None' or 'Lax' on HTTPS
      sameSite: "Lax",
      maxAge: 86400000, // 1 day
      path: "/",
      // domain: '.yourdomain.com' // Enable if backend/frontend are on subdomains
    });

    res
      .header({ "auth-token": accessToken, "auth-rtoken": refreshToken })
      .send(dataToSend);
  } catch (err) {
    next(err);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    res.clearCookie("session_token");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
});

// GENERATING ACCESS TOKEN
const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

export { router as userRoute };
