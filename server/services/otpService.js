import formData from 'form-data';
import Mailgun from 'mailgun.js';

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
// Initialize Mailgun client (singleton pattern)
let mailgunClient = null;
let mailgunDomain = null;

const initializeMailgun = () => {
  if (!mailgunClient) {
    const mailgunApiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;

    if (!mailgunApiKey || !domain) {
      return null;
    }

    const mailgun = new Mailgun(formData);
    mailgunClient = mailgun.client({
      username: 'api',
      key: mailgunApiKey,
    });
    mailgunDomain = domain;
  }
  return { mailgunClient, mailgunDomain };
};

// Email templates
const getOTPTemplate = (otp, purpose = 'verification') => {
  const purposeText = purpose === 'checkout' 
    ? 'complete your checkout' 
    : 'verify your account';
  
  return {
    text: `Your OTP code is: ${otp}. This code will expire in 5 minutes. Use it to ${purposeText}.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OTP Code</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Techligence</h1>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Your OTP Code</h2>
                    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      Use the code below to ${purposeText}:
                    </p>
                    <!-- OTP Box -->
                    <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                      <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${otp}
                      </div>
                    </div>
                    <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                      This code will expire in <strong>5 minutes</strong>.
                    </p>
                    <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 10px 0 0 0;">
                      If you didn't request this code, please ignore this email.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} Techligence. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };
};

export async function sendOTP(email, otp, purpose = 'verification') {
  const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
  const hasMailgunConfig = process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN;

  // In development mode without Mailgun config, just log the OTP
  if (isDevelopment && !hasMailgunConfig) {
    console.log("\n📧 ===== OTP EMAIL (Development Mode - Not Sent) =====");
    console.log(`   To: ${email}`);
    console.log(`   Purpose: ${purpose}`);
    console.log(`   OTP Code: ${otp}`);
    console.log(`   Email not sent - Mailgun credentials not configured`);
    console.log(`   💡 Add MAILGUN_API_KEY and MAILGUN_DOMAIN to server/.env`);
    console.log("==================================================\n");
    return { messageId: "dev-mode-otp-logged", emailSent: false };
  }

  // If Mailgun config is missing in production, log OTP instead of throwing
  if (!hasMailgunConfig) {
    console.error("Mailgun credentials not configured!");
    console.error("   Set MAILGUN_API_KEY and MAILGUN_DOMAIN in server/.env");
    console.log("\n📧 ===== OTP EMAIL (Production Mode - Not Sent) =====");
    console.log(`   To: ${email}`);
    console.log(`   Purpose: ${purpose}`);
    console.log(`   OTP Code: ${otp}`);
    console.log("==================================================\n");
    return { messageId: "prod-mode-otp-logged-no-config", emailSent: false };
  }

  // Initialize Mailgun
  const mailgun = initializeMailgun();
  if (!mailgun) {
    console.error("Failed to initialize Mailgun client");
    return { messageId: "mailgun-init-failed", emailSent: false };
  }

  const { mailgunClient, mailgunDomain } = mailgun;
  const template = getOTPTemplate(otp, purpose);
  const fromEmail = process.env.MAILGUN_FROM_EMAIL || `noreply@${mailgunDomain}`;
  const fromName = process.env.MAILGUN_FROM_NAME || "Techligence";

  const messageData = {
    from: `${fromName} <${fromEmail}>`,
    to: email,
    subject: purpose === 'checkout' 
      ? 'Your Checkout OTP Code - Techligence' 
      : 'Your Verification OTP Code - Techligence',
    text: template.text,
    html: template.html,
  };

  try {
    // Send email via Mailgun with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Mailgun API timeout after 10 seconds")), 10000);
    });

    const sendPromise = mailgunClient.messages.create(mailgunDomain, messageData);
    const response = await Promise.race([sendPromise, timeoutPromise]);

    console.log(`✅ Email sent via Mailgun to ${email}. Message ID: ${response.id}`);
    return { 
      messageId: response.id, 
      emailSent: true 
    };
  } catch (err) {
    console.error("Failed to send email via Mailgun:", err);
    
    // Log OTP when email fails
    console.log("\n📧 ===== OTP EMAIL (Mailgun Failed - OTP Logged) =====");
    console.log(`   To: ${email}`);
    console.log(`   Purpose: ${purpose}`);
    console.log(`   OTP Code: ${otp}`);
    console.log(`   Error: ${err.message || err.code || 'Unknown error'}`);
    console.log("==================================================\n");
    
    return { 
      messageId: "mailgun-failed-otp-logged", 
      emailSent: false,
      error: err.message || err.code || 'Unknown error'
    };
  }
}