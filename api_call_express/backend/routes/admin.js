const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const User = require("../models/User");

// Protect all admin routes with adminAuth middleware
router.use(adminAuth);

// Admin dashboard data route
router.get("/dashboard", async (req, res) => {
  try {
    res.json({
      message: "Admin dashboard data",
      adminUser: req.user.username
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  console.log("Admin /users endpoint called");
  try {
    const users = await User.find().select("-password");
    console.log("Found users:", users.length);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const userToDelete = await User.findById(userId);
    
    // Prevent deleting admin user
    if (userToDelete.username.toLowerCase() === "admin") {
      return res.status(403).json({ message: "Cannot delete admin user" });
    }
    
    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user
router.put("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email } = req.body;
    const userToUpdate = await User.findById(userId);
    
    // Prevent updating admin user
    if (userToUpdate.username.toLowerCase() === "admin") {
      return res.status(403).json({ message: "Cannot update admin user" });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { username, email },
      { new: true }
    ).select("-password");
    
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new user
router.post("/users", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: "Username or email already exists" 
      });
    }

    // Create new user
    const newUser = new User({ username, email, password });
    await newUser.save();

    // Return the new user without password
    const userToReturn = await User.findById(newUser._id).select("-password");
    
    res.status(201).json(userToReturn);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ 
      message: "Error creating user" 
    });
  }
});

module.exports = router;



