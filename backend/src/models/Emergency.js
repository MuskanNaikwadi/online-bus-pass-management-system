const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: "",
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    accuracy: {
      type: Number,
      default: 0,
    },
    
    status: {
      type: String,
      enum: ["Pending", "Resolved"],
      default: "Pending",
    },

    message: {
      type: String,
      default: "Emergency SOS Triggered",
    }

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Emergency", emergencySchema);