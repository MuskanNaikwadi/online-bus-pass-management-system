const Emergency = require("../models/Emergency");
const Notification = require("../models/Notification");
const createEmergency = async (req, res) => {
  try {
    const { latitude, longitude, accuracy } = req.body;

    console.log("BACKEND LOCATION:");
    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);
    console.log("Accuracy:", accuracy);

    // Validate location
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Location is required",
      });
    }

    const emergency = await Emergency.create({
      user: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      latitude,
      longitude,
      accuracy,
    });

    res.status(201).json({
      success: true,
      message: "Emergency alert sent successfully.",
      data: emergency,
    });

  } catch (error) {
    console.error("Emergency Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// Get all emergency alerts
const getAllEmergencies = async (req, res) => {
  try {

    console.log("===== GET ALL EMERGENCIES =====");

    const emergencies = await Emergency.find().sort({ createdAt: -1 });

    console.log("Emergency Count:", emergencies.length);
    console.log("Emergency Data:", emergencies);

    res.status(200).json({
      success: true,
      count: emergencies.length,
      data: emergencies,
    });

  } catch (error) {
    console.error("Get Emergencies Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Resolve emergency
const resolveEmergency = async (req, res) => {
  try {

    const emergency = await Emergency.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found",
      });
    }

    emergency.status = "Resolved";

    await emergency.save();
    await Notification.create({
      user: emergency.user,
      title: "Emergency Resolved",
      message:
        "Your emergency alert has been resolved successfully. Stay safe!",
      type: "sos"
    });
    res.status(200).json({
      success: true,
      message: "Emergency resolved successfully.",
      data: emergency,
    });

  } catch (error) {
    console.error("Resolve Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  createEmergency,
  getAllEmergencies,
  resolveEmergency,
};