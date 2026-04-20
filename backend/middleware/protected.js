import jwt from "jsonwebtoken";
import User from "../Model/user.js";

const authenticate = async (req, res, next) => {
  let token;

  // 1. Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Format: Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

      // 3. Get user from database (excluding password) and attach to req
      req.user = await User.findById(decoded._id).select('-password -repassword');

      // 4. Move to the next middleware/route
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export { authenticate };