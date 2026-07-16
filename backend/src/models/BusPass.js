const mongoose = require("mongoose");

const busPassSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    dob: {
      type: Date,
      required: true,
    },

    gender: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    source: {
      type: String,
      required: true,
    },

    destination: {
      type: String,
      required: true,
    },

    passType: {
      type: String,
      required: true,
    },

    document: {
      type: String,
      default: "",
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Active", "Rejected", "Expired",],
      default: "Pending",
    },
    documentVerified: {
      type: Boolean,
      default: false,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
    passNumber: {
      type: String,
    },

    issueDate: {
      type: Date,
    },

    expiryDate: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ["Success", "Pending", "Failed", "Refunded"],
      default: "Pending",
    },
    refundedAt: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      default: "Online",
    },
    paymentId: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }

);

module.exports = mongoose.model("BusPass", busPassSchema);