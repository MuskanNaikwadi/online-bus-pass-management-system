// controllers/adminSettingsController.js
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const AdminSettings = require("../models/AdminSettings");

// GET /api/admin/settings
exports.getSettings = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select("-password");
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }

    let settings = await AdminSettings.findOne({ admin: req.user.id });
    if (!settings) {
      settings = await AdminSettings.create({ admin: req.user.id });
    }

    return res.status(200).json({
      success: true,
      data: {
        profile: {
          name: admin.name,
          email: admin.email,
          phone: admin.phone || "",
        },
        notifications: settings.notifications,
        system: settings.system,
      },
    });
  } catch (error) {
    console.log("Get Settings Error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// PUT /api/admin/settings/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already in use." });
    }

    const admin = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone },
      { new: true }
    ).select("-password");

    return res.status(200).json({ success: true, data: admin });
  } catch (error) {
    console.log("Update Profile Error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// PUT /api/admin/settings/password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await User.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();

    return res.status(200).json({ success: true, message: "Password updated." });
  } catch (error) {
    console.log("Update Password Error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// PUT /api/admin/settings/notifications
exports.updateNotifications = async (req, res) => {
  try {
    const settings = await AdminSettings.findOneAndUpdate(
      { admin: req.user.id },
      { $set: { notifications: req.body } },
      { new: true, upsert: true }
    );
    return res.status(200).json({ success: true, data: settings.notifications });
  } catch (error) {
    console.log("Update Notifications Error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// PUT /api/admin/settings/system
exports.updateSystemSettings = async (req, res) => {
  try {
    const settings = await AdminSettings.findOneAndUpdate(
      { admin: req.user.id },
      { $set: { system: req.body } },
      { new: true, upsert: true }
    );
    return res.status(200).json({ success: true, data: settings.system });
  } catch (error) {
    console.log("Update System Settings Error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};