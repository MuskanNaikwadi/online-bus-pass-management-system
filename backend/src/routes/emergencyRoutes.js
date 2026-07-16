const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createEmergency,
  getAllEmergencies,
  resolveEmergency,
} = require("../controllers/emergencyController");

// Student sends SOS
router.post("/", protect, createEmergency);

// Admin gets all alerts
router.get("/", protect, getAllEmergencies);

// Admin resolves alert
router.put("/:id/resolve", protect, resolveEmergency);

module.exports = router;