const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/UserRoutes");
const busPassRoutes = require("./routes/busPassroutes");
const path = require("path");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminSettingsRoutes = require("./routes/adminSettingsRoutes");

const emergencyRoutes = require("./routes/emergencyRoutes");
//import AiChat from "./pages/AiChat";
const OpenAI = require("openai");

dotenv.config();

connectDB();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.FRONTEND_URL
  ],
  credentials: true
}));
app.use("/api/notifications", notificationRoutes);
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/buspass", busPassRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/emergency", emergencyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminSettingsRoutes);

app.get("/", (req, res) => {
  res.send("Bus Pass Backend Running...");
});

const client = new OpenAI({
  apiKey: process.env.GROQ_AI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      reply: err.message,
    });
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});