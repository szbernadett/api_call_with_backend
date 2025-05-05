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
  try {
    const users = await User.find().select("-password");
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

module.exports = router;
