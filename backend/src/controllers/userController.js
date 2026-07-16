const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const registerUser = async (req, res) => {
  try {
    const user = await User.create(req.body);

    // ✅ respond immediately, don't block registration on email delivery
    res.status(201).json(user);

    sendEmail(
      user.email,
      "Welcome to Online Bus Pass System",
      `Hello ${user.name},

Your account has been created successfully.

Welcome to the Online Bus Pass System!

Thank you.`
    ).catch((err) => {
      console.log("Welcome email failed (non-blocking):", err.message);
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }

    // Password check
    if (user.password !== password) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked by the administrator.",
      });
    }

    // JWT Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // ✅ respond immediately — don't make the user wait for the email to send
    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user,
    });

    // ✅ send the login alert email AFTER responding (fire-and-forget)
    // this no longer blocks the login response
    sendEmail(
      user.email,
      "Login Alert - Online Bus Pass",
      `Hello ${user.name},

You have successfully logged into your Online Bus Pass account.

Time: ${new Date().toLocaleString()}

Thank you,
Online Bus Pass Team`
    ).catch((err) => {
      console.log("Login email failed (non-blocking):", err.message);
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const logoutUser = async (req, res) => {
  try {
    // ✅ respond immediately
    res.status(200).json({
      success: true,
      message: "Logout Successful",
    });

    sendEmail(
      req.user.email,
      "Logout Alert - Online Bus Pass",
      `Hello ${req.user.name},

You have successfully logged out from your Online Bus Pass account.

Time: ${new Date().toLocaleString()}

If this wasn't you, please change your password immediately.

Thank you,
Online Bus Pass Team`
    ).catch((err) => {
      console.log("Logout email failed (non-blocking):", err.message);
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.gender = req.body.gender || user.gender;
    user.dob = req.body.dob || user.dob;

    await user.save();

    res.status(200).json({
      message: "Profile Updated Successfully",
      user,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.password !== currentPassword) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const uploadProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image",
      });
    }

    user.photo = req.file.filename;

    await user.save();

    res.status(200).json({
      message: "Profile photo uploaded successfully",
      user,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
const deleteProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.photo) {
      return res.status(400).json({
        success: false,
        message: "No photo to delete",
      });
    }

    // ✅ also remove the actual file from disk
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(__dirname, "..", "uploads", user.photo);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.log("File delete warning (may not exist):", err.message);
      }
    });

    user.photo = "";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile photo deleted successfully",
      user,
    });

  } catch (err) {
    console.log("Delete photo error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const getAllUsers = async (req, res) => {
  try {

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};
const blockUser = async (req, res) => {
  try {

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isBlocked = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User blocked successfully",
      data: user,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};
const unblockUser = async (req, res) => {
  try {

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isBlocked = false;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User unblocked successfully",
      data: user,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};
const updateAdminSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can update admin settings",
      });
    }

    const {
      darkMode,
      language,
      newApplicationAlerts,
      emergencyAlerts,
      emailAlerts,
      sessionTimeout,
      twoFactorEnabled,
    } = req.body;

    user.adminSettings = {
      ...user.adminSettings,
      ...(darkMode !== undefined && { darkMode }),
      ...(language !== undefined && { language }),
      ...(newApplicationAlerts !== undefined && { newApplicationAlerts }),
      ...(emergencyAlerts !== undefined && { emergencyAlerts }),
      ...(emailAlerts !== undefined && { emailAlerts }),
      ...(sessionTimeout !== undefined && { sessionTimeout }),
      ...(twoFactorEnabled !== undefined && { twoFactorEnabled }),
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Admin settings updated successfully",
      data: user.adminSettings,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  changePassword,
  uploadProfilePhoto,
  deleteProfilePhoto,
  logoutUser,
  getAllUsers,
  blockUser,
  unblockUser,
  updateAdminSettings,
};