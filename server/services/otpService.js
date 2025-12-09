import nodemailer from "nodemailer";

const otps = new Map(); // 

export function generateOTP(length = 6) {
  return Math.floor(100000 + Math.random() * 900000)
    .toString()
    .substring(0, length);
}

export function saveOTP(email, otp) {
  otps.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // 5 minutes expiry
}

export function verifyOTP(email, inputOtp) {
  const record = otps.get(email);
  if (!record) return false;

  if (Date.now() > record.expiresAt) {
    otps.delete(email);
    return false;
  }

  const isValid = record.otp === inputOtp;
  if (isValid) otps.delete(email); // remove after use
  return isValid;
}
export async function sendOTP(email, otp) {
  const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
  const hasEmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASS;

  // In development mode without email config, just log the OTP
  if (isDevelopment && !hasEmailConfig) {
    console.log("\n📧 ===== OTP EMAIL (Development Mode - Not Sent) =====");
    console.log(`   To: ${email}`);
    console.log(`   OTP Code: ${otp}`);
    console.log(`    Email not sent - SMTP credentials not configured`);
    console.log(`   💡 Add EMAIL_USER and EMAIL_PASS to server/.env to enable email sending`);
    console.log("==================================================\n");
    return { messageId: "dev-mode-otp-logged" };
  }

  // If email config is missing in production, throw error
  if (!hasEmailConfig) {
    console.error("Email credentials not configured!");
    console.error("   Set EMAIL_USER and EMAIL_PASS in server/.env");
    throw new Error("Email service not configured");
  }

  // Try to send email with configured credentials - simplified service-based config
  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000, // 10 seconds connection timeout
    socketTimeout: 10000, // 10 seconds socket timeout
  });

  const mailOptions = {
    from: `"Techligence" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}. This code will expire in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Your OTP Code</h2>
        <p>Your OTP code is: <strong style="font-size: 24px; color: #2563eb;">${otp}</strong></p>
        <p>This code will expire in 5 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  };

  try {
    // Wrap sendMail in Promise.race with timeout to ensure it fails fast
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Email sending timeout after 15 seconds")), 15000);
    });

    const sendMailPromise = transporter.sendMail(mailOptions);
    const info = await Promise.race([sendMailPromise, timeoutPromise]);
    
    console.log(`Email sent to ${email}. MessageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error("Failed to send email:");
    console.error(err);
    
    // In development, don't throw error, just log it
    if (isDevelopment) {
      console.log("\n📧 ===== OTP EMAIL (Fallback - Email Failed) =====");
      console.log(`   To: ${email}`);
      console.log(`   OTP Code: ${otp}`);
      console.log("==================================================\n");
      return { messageId: "dev-mode-otp-logged-after-error" };
    }
    
    throw err; // In production, throw the error
  }
}