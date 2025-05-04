const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify token
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: "Please authenticate" });
  }
};

module.exports = { authenticate, JWT_SECRET };