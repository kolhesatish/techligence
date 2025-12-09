import express from "express";
import { generateOTP, saveOTP, sendOTP, verifyOTP } from "../services/otpService.js";

const router = express.Router();

// send OTP
router.post("/send", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email is required" });

  const otp = generateOTP();
  saveOTP(email, otp);

  try {
    const emailResult = await sendOTP(email, otp);
    if (emailResult.emailSent === false) {
      return res.json({ 
        success: true, 
        message: "OTP could not be sent via email. Please contact support.",
      });
    } else {
      return res.json({ success: true, message: "OTP sent to email" });
    }
  } catch (err) {
    // This should rarely happen now, but handle it just in case
    console.error("Unexpected error in email sending:", err);
    return res.json({ 
      success: true, 
      message: "OTP could not be sent via email. Please contact support.",
    });
  }
});

// verify OTP
router.post("/verify", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, error: "Email and OTP are required" });

  if (verifyOTP(email, otp)) {
    return res.json({ success: true, message: "OTP verified" });
  } else {
    return res.status(400).json({ success: false, error: "Invalid or expired OTP" });
  }
});

export default router;