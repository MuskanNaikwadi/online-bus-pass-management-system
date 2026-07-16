const Notification = require("../models/Notification");

const getUserNotifications = async (req, res) => {
  try {

    const notifications = await Notification.find({
      forAdmin: true
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notifications
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

module.exports = {
  getUserNotifications
};