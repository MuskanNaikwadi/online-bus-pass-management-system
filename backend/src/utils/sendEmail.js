const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log("✅ Email sent successfully");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);

  } catch (error) {
    console.log("❌ Email Error:", error.message);
  }
};

module.exports = sendEmail;