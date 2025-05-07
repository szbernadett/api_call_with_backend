const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
// Add these new imports
const { body, validationResult } = require("express-validator");
const xss = require("xss");

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Helper function to create token
const createToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Signup route with validation and sanitisation
router.post("/signup", [
  // Add validation chain
  body("username")
    .trim()
    .isLength({ min: 3 }).withMessage("Username must be at least 3 characters")
    .escape(),
  body("email")
    .isEmail().withMessage("Must provide a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
], async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: errors.array() 
      });
    }

    const { username, email, password } = req.body;

    // Sanitise inputs
    const sanitisedUsername = xss(username);
    const sanitisedEmail = xss(email);

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username: sanitisedUsername }, { email: sanitisedEmail }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: "Username or email already exists" 
      });
    }

    // Create new user with sanitised inputs
    const newUser = new User({ 
      username: sanitisedUsername, 
      email: sanitisedEmail, 
      password 
    });
    await newUser.save();

    res.status(201).json({ 
      message: "User created successfully" 
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      message: "Error creating user" 
    });
  }
});

// Login route with validation and sanitisation
router.post("/login", [
  // Add validation chain
  body("username").trim().escape(),
  body("password").isLength({ min: 1 })
], async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: errors.array() 
      });
    }

    const { username, password } = req.body;

    // Sanitise inputs
    const sanitisedUsername = xss(username);

    // Find user
    const user = await User.findOne({ username: sanitisedUsername });
    if (!user) {
      return res.status(401).json({ 
        message: "Invalid credentials" 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: "Invalid credentials" 
      });
    }

    // Create token
    const token = createToken(user);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Send response with sanitised user data
    res.json({
      user: {
        id: user._id,
        username: xss(user.username),
        email: xss(user.email)
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      message: "Error logging in" 
    });
  }
});

// Check auth status - add sanitisation to response
router.get("/status", async (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ 
        authenticated: false 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ 
        authenticated: false 
      });
    }

    // Return sanitised user data
    res.json({
      authenticated: true,
      user: {
        id: user._id,
        username: xss(user.username),
        email: xss(user.email)
      }
    });
  } catch (error) {
    console.error("Auth status error:", error);
    res.status(401).json({ 
      authenticated: false 
    });
  }
});

// Logout route remains unchanged
router.post("/logout", (req, res) => {
  try {
    // Clear the token cookie
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 0 // Expire immediately
    });
    
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Error logging out" });
  }
});

module.exports = router;
