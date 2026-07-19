const User = require("../models/user");
const BusPass = require("../models/BusPass");
const Emergency = require("../models/Emergency");

const getDashboardStats = async (req, res) => {

    try {

        // Only admin can access
        if (req.user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Access Denied"
            });

        }

        const totalUsers = await User.countDocuments();

        const activePasses = await BusPass.countDocuments({
            status: "Active"
        });

        const pendingPasses = await BusPass.countDocuments({
            status: "Pending"
        });

        const rejectedPasses = await BusPass.countDocuments({
            status: "Rejected"
        });

        const emergencyCount = await Emergency.countDocuments({
            status: "Pending"
        });
        const totalApplications = await BusPass.countDocuments();

        // Recent 5 users
        const recentUsers = await User.find()
            .select("-password")
            .sort({ createdAt: -1 })
            .limit(5);

        // Recent 5 SOS
        const recentEmergencies = await Emergency.find()
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({

            success: true,

            data: {

                totalUsers,
                
                totalApplications,

                activePasses,

                pendingPasses,

                rejectedPasses,

                emergencyCount,

                recentUsers,

                recentEmergencies

            }

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

};

module.exports = {

    getDashboardStats

};