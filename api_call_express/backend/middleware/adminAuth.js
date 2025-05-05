const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if user is admin (username is "admin" case insensitive)
    if (user.username.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    res.status(401).json({ message: "Authentication required" });
  }
};

module.exports = adminAuth;