const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { JWT_SECRET } = require("../middleware/auth");
const jwt = require("jsonwebtoken");

// Register a new user
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: "User already exists with that email or username" 
      });
    }
    
    // Create new user
    const user = new User({ username, email, password });
    await user.save();
    
    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "24h"
    });
    
    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res.status(201).json({
      message: "User created successfully",
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "24h"
    });
    
    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res.json({
      message: "Login successful",
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Logout user
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;