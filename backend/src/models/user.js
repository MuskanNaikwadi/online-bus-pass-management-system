const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      default: "",
    },

    dob: {
      type: Date,
    },

    role: {
      type: String,
      enum: [
        "user",
        "admin",
      ],
      default: "user",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },

    photo: {
      type: String,
      default: "",
    },

    darkMode: {
      type: Boolean,
      default: false,
    },
    notifications: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      enum: ["en", "hi", "mr", "ta", "te"],
      default: "en",
    },
    emailAlerts: {
      type: Boolean,
      default: true,
    },
    smsAlerts: {
      type: Boolean,
      default: false,
    },
    adminDarkMode: {
      type: Boolean,
      default: false,
    },
    adminLanguage: {
      type: String,
      enum: ["en", "hi"],
      default: "en",
    },
    adminEmailAlerts: {
      type: Boolean,
      default: true,
    },
    adminSmsAlerts: {
      type: Boolean,
      default: false,
    },
    adminNewApplicationAlerts: {
      type: Boolean,
      default: true,
    },
    adminEmergencyAlerts: {
      type: Boolean,
      default: true,
    },
    adminSessionTimeout: {
      type: Number, // minutes
      default: 30,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);