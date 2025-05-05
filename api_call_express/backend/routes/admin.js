const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");

// Protect all admin routes with adminAuth middleware
router.use(adminAuth);

// Admin dashboard data route
router.get("/dashboard", async (req, res) => {
  try {
    // Here you would fetch admin-specific data
    // For now, just return a simple response
    res.json({
      message: "Admin dashboard data",
      adminUser: req.user.username
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add more admin routes as needed

module.exports = router;