// models/AdminSettings.js
const mongoose = require("mongoose");

const adminSettingsSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    notifications: {
      emailOnNewApplication: { type: Boolean, default: true },
      emailOnEmergency: { type: Boolean, default: true },
      smsOnEmergency: { type: Boolean, default: false },
      soundAlerts: { type: Boolean, default: true },
    },
    system: {
      autoApprove: { type: Boolean, default: false },
      maxPassValidityDays: { type: Number, default: 365 },
      emergencyResponseMinutes: { type: Number, default: 15 },
      passTypes: { type: String, default: "Monthly, Quarterly, Annual" },
      supportEmail: { type: String, default: "" },
      supportPhone: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminSettings", adminSettingsSchema);