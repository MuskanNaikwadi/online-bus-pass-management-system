const express = require("express");
const router = express.Router();
const { registerUser, loginUser, updateProfile, changePassword, uploadProfilePhoto, deleteProfilePhoto, logoutUser, getAllUsers, blockUser, unblockUser, updateAdminSettings, } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/update-profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.post("/logout", protect, logoutUser);
router.put(
  "/upload-photo",
  protect,
  upload.single("photo"),
  uploadProfilePhoto
);
router.put(
  "/upload-photo",
  protect,
  upload.single("photo"),
  uploadProfilePhoto
);

router.put(
  "/delete-photo",
  protect,
  deleteProfilePhoto
);
router.get(
  "/all-users",
  protect,
  getAllUsers
);
router.put(
  "/block/:id",
  protect,
  blockUser
);

router.put(
  "/unblock/:id",
  protect,
  unblockUser
);
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});
router.put("/admin-settings", protect, updateAdminSettings);
module.exports = router;