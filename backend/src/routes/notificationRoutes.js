const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
    getUserNotifications,
} = require("../controllers/notificationController");

router.get("/", protect, getUserNotifications);

module.exports = router;