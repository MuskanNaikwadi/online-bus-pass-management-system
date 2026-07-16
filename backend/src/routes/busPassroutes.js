const express = require("express");
const router = express.Router();

const {
  createBusPass,
  getMyPasses,
  getAllPasses,
  getApprovedPasses,
  getPendingPasses,
  getRejectedPasses,
  approvePass,
  rejectPass,
  getNotifications,
  getUserNotifications,
  getStats,
  getPaymentHistory,
  createPayment,
  sendSOS,
  updateSettings,
  verifyPass,
  verifyDocument,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/busPassController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/", protect, upload.single("document"), createBusPass);

router.get("/", protect, getAllPasses);
router.get("/my", protect, getMyPasses);
router.get("/approved", protect, getApprovedPasses);
router.get("/pending", protect, getPendingPasses);
router.get("/rejected", protect, getRejectedPasses);
router.put("/:id/verify-document",protect,verifyDocument);
router.put("/:id/approve", protect, approvePass);
router.put("/:id/reject", protect, rejectPass);

router.get("/notifications", protect, getNotifications);
router.get("/user-notifications", protect, getUserNotifications);

router.get("/stats", getStats);
router.get("/verify/:id", verifyPass);
router.get("/user-notifications", protect, getUserNotifications);
router.put("/notifications/:id/read", protect, markNotificationRead);
router.put("/notifications/read-all", protect, markAllNotificationsRead);

router.get("/payment-history", protect, getPaymentHistory);

router.post("/payment", protect, createPayment);
router.put("/settings", protect, updateSettings);
router.post("/sos", protect, sendSOS);
module.exports = router;