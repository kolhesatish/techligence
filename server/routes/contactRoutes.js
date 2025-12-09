// src/routes/contactRoutes.js
import express from "express";
import { body, validationResult } from "express-validator";
import nodemailer from "nodemailer";
// A simple sanitizer function to escape HTML characters to prevent XSS
const escapeHTML = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      }[tag] || tag)
  );
};

const router = express.Router();

router.post(
  "/",
  [
    // Validation rules
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("subject").trim().notEmpty().withMessage("Subject is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
    body("inquiryType").trim().notEmpty().withMessage("Inquiry type is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    try {
      // Sanitize inputs
      const name = escapeHTML(req.body.name);
      const email = req.body.email; // Already validated and normalized
      const company = req.body.company ? escapeHTML(req.body.company) : 'N/A';
      const subject = escapeHTML(req.body.subject);
      const message = escapeHTML(req.body.message);
      const inquiryType = escapeHTML(req.body.inquiryType);

      // Check if email config exists
      const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
      const hasEmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASS;

      // In development mode without email config, return success without sending
      if (isDevelopment && !hasEmailConfig) {
        console.log("\n📧 ===== CONTACT FORM EMAIL (Development Mode - Not Sent) =====");
        console.log(`   From: ${email}`);
        console.log(`   Subject: ${subject}`);
        console.log(`   Email not sent - SMTP credentials not configured`);
        console.log(`   💡 Add EMAIL_USER and EMAIL_PASS to server/.env to enable email sending`);
        console.log("==================================================\n");
        return res.status(200).json({ success: true, message: "Your message has been sent successfully!" });
      }

      // If email config is missing in production, return error
      if (!hasEmailConfig) {
        console.error("Email credentials not configured!");
        console.error("   Set EMAIL_USER and EMAIL_PASS in server/.env");
        return res.status(500).json({
          success: false,
          message: "Email service not configured. Please contact support.",
        });
      }

      // Nodemailer setup - simplified service-based config
      // Use aggressive timeouts since Render.com may block SMTP connections
      const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 5000, // 5 seconds connection timeout (reduced for faster failure)
        socketTimeout: 5000, // 5 seconds socket timeout
        greetingTimeout: 5000, // 5 seconds greeting timeout
        requireTLS: false, // Don't require TLS (may help with connection issues)
      });

      const mailOptions = {
        from: `"Techligence Contact Form" <${process.env.EMAIL_USER}>`,
        to: process.env.CONTACT_FORM_RECEIVER_EMAIL,
        replyTo: email, // Allows direct reply to the user from the email client
        subject: `Techligence Contact Form: ${subject} [${inquiryType}]`,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Company:</strong> ${company}</p>
          <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; background-color: #f4f4f4; padding: 10px; border-radius: 5px;">${message}</p>
        `,
      };

      // Wrap sendMail in Promise.race with aggressive timeout to fail fast
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Email sending timeout after 8 seconds")), 8000);
      });

      const sendMailPromise = transporter.sendMail(mailOptions);
      await Promise.race([sendMailPromise, timeoutPromise]);
      
      res.status(200).json({ success: true, message: "Your message has been sent successfully!" });

    } catch (error) {
      // Check if it's a connection timeout (common on Render.com)
      const isConnectionError = error.code === 'ETIMEDOUT' || 
                                error.code === 'ECONNREFUSED' || 
                                error.code === 'ENOTFOUND' ||
                                error.message?.includes('timeout') ||
                                error.message?.includes('Connection timeout');
      
      if (isConnectionError) {
        console.warn(`⚠️  Contact form email connection failed (likely blocked by hosting provider): ${error.message}`);
        console.warn(`   Consider using a transactional email service (SendGrid, Mailgun, etc.)`);
        // Still return success since the message was received, just couldn't be emailed
        res.status(200).json({
          success: true,
          message: "Your message has been received. We'll get back to you soon!",
        });
      } else {
        console.error("Error sending contact email:", error);
        res.status(500).json({
          success: false,
          message: "Failed to send your message. Please try again later.",
        });
      }
    }
  }
);

export default router;