// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// ---- Verify token & attach user ----
const protect = async (req, res, next) => {
  try {
    console.log("========== AUTH ==========");
    console.log("Authorization:", req.headers.authorization);

    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer")
    ) {
      console.log("No Token");
      return res.status(401).json({ message: "No Token" });
    }

    const token = req.headers.authorization.split(" ")[1];
    console.log("Token:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded);

    const user = await User.findById(decoded.id).select("-password");
    console.log("User:", user);

    if (!user) {
      console.log("User Not Found");
      return res.status(401).json({ message: "User Not Found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log("JWT Error:", err.message);
    return res.status(401).json({ message: err.message });
  }
};

// ---- Restrict route to admins only ----
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not Authenticated" });
  }

  if (req.user.role !== "admin") {
    console.log("Access Denied - Role:", req.user.role);
    return res.status(403).json({ message: "Access Denied: Admins Only" });
  }

  next();
};

module.exports = { protect, isAdmin };