// routes/adminSettingsRoutes.js
const express = require("express");
const router = express.Router();
const { protect, isAdmin } = require("../middleware/authMiddleware"); // adjust to your existing auth middleware
const {
  getSettings,
  updateProfile,
  updatePassword,
  updateNotifications,
  updateSystemSettings,
} = require("../controllers/AdminSettingsController");

router.get("/settings", protect, isAdmin, getSettings);
router.put("/settings/profile", protect, isAdmin, updateProfile);
router.put("/settings/password", protect, isAdmin, updatePassword);
router.put("/settings/notifications", protect, isAdmin, updateNotifications);
router.put("/settings/system", protect, isAdmin, updateSystemSettings);

module.exports = router;