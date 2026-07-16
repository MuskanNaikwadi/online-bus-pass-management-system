const BusPass = require("../models/BusPass");
const Notification = require("../models/Notification");
const createBusPass = async (req, res) => {
    try {
        const {
            fullName,
            dob,
            gender,
            mobile,
            email,
            category,
            source,
            destination,
            passType,


        } = req.body;

        const birthDate = new Date(dob);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();

        if (
            today.getMonth() < birthDate.getMonth() ||
            (
                today.getMonth() === birthDate.getMonth() &&
                today.getDate() < birthDate.getDate()
            )
        ) {
            age--;
        }

        let finalCategory = category;

        // Validation
        if (category === "Child" && age > 12) {
            return res.status(400).json({
                message: "Only age 12 or below can apply as Child."
            });
        }

        if (category === "Senior Citizen" && age < 60) {
            return res.status(400).json({
                message: "Only age 60 or above can apply as Senior Citizen."
            });
        }

        // Pass Fee
        let passFee = 0;

        switch (passType) {

            case "One Day":
                passFee = 50;
                break;

            case "Monthly":
                passFee = 500;
                break;

            case "Quarterly":
                passFee = 1300;
                break;

            case "Half Yearly":
                passFee = 2500;
                break;

            case "Yearly":
                passFee = 4500;
                break;

            default:
                passFee = 0;
        }

        // Discount
        let discount = 0;

        switch (finalCategory) {

            case "Student":
                discount = passFee * 0.40;
                break;

            case "Senior Citizen":
                discount = passFee * 0.50;
                break;

            case "Child":
                // ✅ age-based tiers: 0-5 free, 6-12 half price
                if (age <= 5) {
                    discount = passFee; // fully free
                } else {
                    discount = passFee * 0.50;
                }
                break;

            case "General":
            default:
                discount = 0;
        }

        // Final Amount
        const totalAmount = passFee - discount;
        // Generate Pass Number
        const passNumber = "P-" + Math.floor(100000 + Math.random() * 900000);

        // Issue Date
        const issueDate = new Date();

        // Expiry Date
        const expiryDate = new Date();

        switch (passType) {

            case "One Day":
                expiryDate.setDate(expiryDate.getDate() + 1);
                break;

            case "Monthly":
                expiryDate.setMonth(expiryDate.getMonth() + 1);
                break;

            case "Quarterly":
                expiryDate.setMonth(expiryDate.getMonth() + 3);
                break;

            case "Half Yearly":
                expiryDate.setMonth(expiryDate.getMonth() + 6);
                break;

            case "Yearly":
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                break;
        }
        const busPass = await BusPass.create({
            user: req.user._id,
            fullName,
            dob,
            gender,
            mobile,
            email,
            category: finalCategory,
            source,
            destination,
            passType,
            amount: totalAmount,
            document: req.file ? req.file.path : "",

            passNumber,
            issueDate,
            expiryDate,
            status: "Pending",

            paymentStatus: "Success",
            paymentMethod: "Online",
            paymentId: "PAY-" + Math.floor(100000 + Math.random() * 900000),
            paidAt: new Date(),
        });


        await Notification.create({

            user: req.user._id,

            title: "New Bus Pass Application",

            message: `${fullName} submitted a new bus pass application.`,

            type: "approval",

            forAdmin: true

        });

        await Notification.create({
            user: req.user._id,
            title: "Payment Successful",
            message: `₹${totalAmount} paid for your ${passType} pass (${passNumber}). Application is under review.`,
            type: "payment",
        });

        res.status(201).json({
            success: true,
            message: "Bus Pass Application Submitted Successfully",
            data: busPass,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
const checkExpiredPasses = async () => {

    const today = new Date();

    await BusPass.updateMany(
        {
            status: "Active",
            expiryDate: { $lt: today }
        },
        {
            $set: {
                status: "Expired"
            }
        }
    );

};
const getMyPasses = async (req, res) => {

    await checkExpiredPasses();

    try {

        const passes = await BusPass.find({
            user: req.user._id,
            status: {
                $ne: "Expired"
            }
        }).sort({
            createdAt: -1
        });


        res.json({
            success: true,
            data: passes
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const getApprovedPasses = async (req, res) => {
    try {
        const passes = await BusPass.find({
            status: "Active",
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: passes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getPendingPasses = async (req, res) => {
    try {
        const passes = await BusPass.find({
            status: "Pending",
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: passes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
const getRejectedPasses = async (req, res) => {
    try {
        const passes = await BusPass.find({
            status: "Rejected",
        }).sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            data: passes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
const getAllPasses = async (req, res) => {
    try {
        const passes = await BusPass.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: passes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
const approvePass = async (req, res) => {
    try {
        const pass = await BusPass.findById(req.params.id);

        if (!pass) {
            return res.status(404).json({
                success: false,
                message: "Pass not found",
            });
        }

        if (!pass.documentVerified) {
            return res.status(400).json({
                success: false,
                message: "Please verify the document first",
            });
        }

        pass.status = "Active";

        await pass.save();
        await Notification.create({
            user: pass.user,
            title: "Bus Pass Approved",
            message: "Your bus pass has been approved successfully.",
            type: "approval",
        });
        res.status(200).json({
            success: true,
            message: "Pass Approved Successfully",
            data: pass,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
const verifyDocument = async (req, res) => {
    try {

        const pass = await BusPass.findById(req.params.id);

        if (!pass) {
            return res.status(404).json({
                success: false,
                message: "Application not found",
            });
        }

        if (pass.documentVerified) {
            return res.status(400).json({
                success: false,
                message: "Document already verified",
            });
        }

        pass.documentVerified = true;
        pass.verifiedBy = req.user._id;
        pass.verifiedAt = new Date();

        await pass.save();

        res.status(200).json({
            success: true,
            message: "Document Verified Successfully",
            data: pass,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

const rejectPass = async (req, res) => {
    try {
        const pass = await BusPass.findById(req.params.id);

        if (!pass) {
            return res.status(404).json({
                success: false,
                message: "Pass not found",
            });
        }

        pass.status = "Rejected";

        if (pass.paymentStatus === "Success") {
            pass.paymentStatus = "Refunded";
            pass.refundedAt = new Date();
        }

        await pass.save();

        await Notification.create({
            user: pass.user,
            title: "Bus Pass Rejected",
            message: "Your bus pass application has been rejected.",
            type: "rejection",
        });

        if (pass.paymentStatus === "Refunded") {
            await Notification.create({
                user: pass.user,
                title: "Payment Refunded",
                message: `₹${pass.amount} has been refunded for your rejected bus pass application (${pass.passNumber}).`,
                type: "refund",
            });
        }

        res.status(200).json({
            success: true,
            message: "Pass Rejected Successfully",
            data: pass,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getNotifications = async (req, res) => {
    try {
        const passes = await BusPass.find()
            .sort({ updatedAt: -1 });

        const notifications = passes.map((pass) => ({
            message: `Bus pass ${pass.fullName} is ${pass.status}`,
            date: pass.updatedAt,
            status: pass.status,
        }));

        res.json({
            success: true,
            data: notifications,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};




const getUserNotifications = async (req, res) => {
    try {

        console.log("Logged in User:", req.user._id);

        const passes = await BusPass.find({
            user: req.user._id,
        });
        const today = new Date();

        for (const pass of passes) {

            const days =
                Math.ceil(
                    (new Date(pass.expiryDate) - today) /
                    (1000 * 60 * 60 * 24)
                );

            if (days <= 7 && days >= 0) {

                const exists = await Notification.findOne({
                    user: req.user._id,
                    title: "Pass Expiring"
                });

                if (!exists) {

                    await Notification.create({
                        user: req.user._id,
                        title: "Pass Expiring",
                        message: `Your bus pass will expire in ${days} day(s).`,
                        type: "expiry"
                    });

                }

            }

        }

        console.log("Passes:", passes);

        const notifications = await Notification.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getStats = async (req, res) => {
    try {
        const passes = await BusPass.find();

        res.json({
            success: true,
            data: {
                totalPasses: passes.length,
                activePasses: passes.filter(p => p.status === "Active").length,
                pendingPasses: passes.filter(p => p.status === "Pending").length,
                rejectedPasses: passes.filter(p => p.status === "Rejected").length,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getPaymentHistory = async (req, res) => {
    try {
        const payments = await BusPass.find({
            user: req.user._id,
            amount: { $gt: 0 },
        }).sort({ paidAt: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            data: payments,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
const createPayment = async (req, res) => {

    try {
        const { passId, paymentMethod } = req.body;

        if (!passId) {
            return res.status(400).json({
                success: false,
                message: "passId is required",
            });
        }

        const pass = await BusPass.findOne({
            _id: passId,
            user: req.user._id,
        });

        if (!pass) {
            return res.status(404).json({
                success: false,
                message: "Pass not found",
            });
        }

        pass.paymentStatus = "Success";
        pass.paymentMethod = paymentMethod || "Online";
        pass.paymentId = "PAY-" + Math.floor(100000 + Math.random() * 900000);
        pass.paidAt = new Date();

        await pass.save();

        res.json({
            success: true,
            message: "Payment Done",
            data: pass,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const sendSOS = async (req, res) => {
    try {
        const { message, location } = req.body;

        await Notification.create({
            user: req.user._id,
            title: "SOS Alert Sent",
            message: `Your emergency SOS was triggered. Location: ${location || "Unknown"}`,
            type: "sos",
        });

        res.status(200).json({
            success: true,
            message: "SOS Alert Sent Successfully",
            data: {
                user: req.user._id,
                message,
                location,
                time: new Date(),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
const updateSettings = async (req, res) => {
    try {
        const User = require("../models/User");

        const { darkMode, notifications, language, emailAlerts, smsAlerts } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (darkMode !== undefined) user.darkMode = darkMode;
        if (notifications !== undefined) user.notifications = notifications;
        if (language !== undefined) user.language = language;
        if (emailAlerts !== undefined) user.emailAlerts = emailAlerts;
        if (smsAlerts !== undefined) user.smsAlerts = smsAlerts;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Settings updated successfully",
            data: user,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const verifyPass = async (req, res) => {
    try {

        const pass = await BusPass.findById(req.params.id);

        if (!pass) {
            return res.status(404).json({
                success: false,
                message: "Pass not found",
            });
        }

        res.status(200).json({
            success: true,
            data: pass,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};
const markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        res.status(200).json({
            success: true,
            data: notification,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const markAllNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({
            success: true,
            message: "All notifications marked as read",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createBusPass,
    getMyPasses,
    getApprovedPasses,
    getPendingPasses,
    getRejectedPasses,
    approvePass,
    rejectPass,
    getAllPasses,
    getNotifications,
    getUserNotifications,
    getStats,
    getPaymentHistory,
    createPayment,
    sendSOS,
    updateSettings,
    verifyPass,
    verifyDocument,
    markNotificationRead,
    markAllNotificationsRead,
};
