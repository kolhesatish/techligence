import express from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";
import { resolveSoa } from "dns";
import { sendOTP, generateOTP, saveOTP, verifyOTP } from "../services/otpService.js";

const router = express.Router();


// Generate JWT token
const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    console.error("JWT_SECRET is not set in environment variables!");
    console.error("   Please create a .env file in the server directory with:");
    console.error("   JWT_SECRET=your-super-secret-jwt-key-here");
    throw new Error("JWT_SECRET environment variable is required. Please set it in your .env file.");
  }
  
  return jwt.sign({ userId }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Register new user
router.post(
  "/register",
  [
    body("firstName")
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
    body("lastName")
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      ),
  ],
  async (req, res) => {
    try {
      // Demo mode response
      if (req.demoMode) {
        return res.status(201).json({
          success: true,
          message: "Demo user registered successfully",
          user: {
            id: "demo-user-id",
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            role: "user",
          },
          token: "demo-jwt-token",
        });
      }

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { firstName, lastName, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      // Create new user
      const user = new User({
        firstName,
        lastName,
        email,
        password,
      });

      await user.save();

      // Send OTP
      const otp = generateOTP();
      saveOTP(email, otp);
      
      try {
        const emailResult = await sendOTP(email, otp);
        
        // Check if email was actually sent
        if (emailResult.emailSent === false) {
          // Email failed but OTP is saved - registration succeeds
          console.warn(`⚠️  User registered but email failed to send. OTP logged in console.`);
          res.status(201).json({
            success: true,
            message: "User registered. OTP could not be sent via email. Please contact support.",
            data: { userId: user._id },
            emailSent: false,
          });
        } else {
          // Email sent successfully
          res.status(201).json({
            success: true,
            message: "User registered. OTP sent to email.",
            data: { userId: user._id },
          });
        }
      } catch (emailError) {
        // This should rarely happen now, but handle it just in case
        console.error("Unexpected error in email sending:", emailError);
        // Still allow registration to succeed
        res.status(201).json({
          success: true,
          message: "User registered. OTP could not be sent via email. Please contact support.",
          data: { userId: user._id },
          emailSent: false,
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);

// Login user
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      // Demo mode response
      if (req.demoMode) {
        return res.status(200).json({
          success: true,
          message: "Demo login successful",
          data: {
            user: {
              id: "demo-user-id",
              firstName: "Demo",
              lastName: "User",
              email: req.body.email,
              role: "user",
            },
            token: "demo-jwt-token",
          },
        });
      }

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Check if user is active
      if (!user.isActive) {
        // Resend OTP if the user is not active
        const otp = generateOTP();
        saveOTP(email, otp);
        
        try {
          const emailResult = await sendOTP(email, otp);
          if (emailResult.emailSent === false) {
            return res.status(401).json({
              success: false,
              message: "Account is not activated. OTP could not be sent via email. Please contact support.",
            });
          } else {
            return res.status(401).json({
              success: false,
              message: "Account is not activated. A new OTP has been sent to your email.",
            });
          }
        } catch (emailError) {
          // This should rarely happen now, but handle it just in case
          console.error("Unexpected error in email sending:", emailError);
          return res.status(401).json({
            success: false,
            message: "Account is not activated. OTP could not be sent via email. Please contact support.",
          });
        }
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Generate token
      const token = generateToken(user._id);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: user.toJSON(),
          token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: { user: user.toJSON() },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
});

// Update user profile
router.put(
  "/profile",
  authenticateToken,
  [
    body("firstName")
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
    body("lastName")
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const allowedUpdates = ["firstName", "lastName"];
      const updates = {};

      Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      const user = await User.findByIdAndUpdate(req.userId, updates, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: { user: user.toJSON() },
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
      });
    }
  },
);

// Change password
router.put(
  "/change-password",
  authenticateToken,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "New password must contain at least one lowercase letter, one uppercase letter, and one number",
      ),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Verify current password
      const isCurrentPasswordValid =
        await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to change password",
      });
    }
  },
);

// Logout (client-side token invalidation)
router.post("/logout", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Logout successful",
  });
});

// Refresh token
router.post("/refresh", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    // Generate new token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: { token },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to refresh token",
    });
  }
});


router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (verifyOTP(email, otp)) {
      const user = await User.findOneAndUpdate(
        { email },
        { isActive: true, emailVerified: true },
        { new: true },
      );

      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "User not found." });
      }

      // Generate token
      const token = generateToken(user._id);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.json({
        success: true,
        message: "OTP verified successfully. Login successful.",
        data: {
          user: user.toJSON(),
          token,
        },
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ success: false, message: "OTP verification failed." });
  }
});

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.isActive) {
      return res.status(400).json({ success: false, message: "Account is already activated." });
    }

    const otp = generateOTP();
    saveOTP(email, otp);
    
    try {
      const emailResult = await sendOTP(email, otp);
      if (emailResult.emailSent === false) {
        res.json({ 
          success: true, 
          message: "OTP could not be sent via email. Please contact support.",
        });
      } else {
        res.json({ success: true, message: "A new OTP has been sent to your email." });
      }
    } catch (emailError) {
      // This should rarely happen now, but handle it just in case
      console.error("Unexpected error in email sending:", emailError);
      res.json({ 
        success: true, 
        message: "OTP could not be sent via email. Please contact support.",
      });
    }
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ success: false, message: "Failed to resend OTP." });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const otp = generateOTP();
    saveOTP(email, otp);
    
    try {
      const emailResult = await sendOTP(email, otp);
      if (emailResult.emailSent === false) {
        res.json({ 
          success: true, 
          message: "OTP could not be sent via email. Please contact support.",
        });
      } else {
        res.json({ success: true, message: "An OTP has been sent to your email to reset your password." });
      }
    } catch (emailError) {
      // This should rarely happen now, but handle it just in case
      console.error("Unexpected error in email sending:", emailError);
      res.json({ 
        success: true, 
        message: "OTP could not be sent via email. Please contact support.",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Failed to send password reset OTP." });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (verifyOTP(email, otp)) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }

      user.password = newPassword;
      await user.save();

      res.json({ success: true, message: "Password has been reset successfully." });
    } else {
      res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Failed to reset password." });
  }
});

// Google OAuth routes
// Initiate Google OAuth
router.get("/google", (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    const scope = "profile email";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    
    if (!clientId) {
      console.error("Google OAuth Error: GOOGLE_CLIENT_ID is not set in environment variables");
      // Redirect to frontend with error instead of returning JSON
      return res.redirect(`${frontendUrl}/auth?error=google_oauth_not_configured&message=Google OAuth is not configured. Please contact support.`);
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
    
    res.redirect(authUrl);
  } catch (error) {
    console.error("Google OAuth initiation error:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/auth?error=google_auth_init_error&message=Failed to initiate Google authentication.`);
  }
});

// Google OAuth callback
router.get("/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    if (!code) {
      return res.redirect(`${frontendUrl}/auth?error=google_auth_failed`);
    }

    if (!clientId || !clientSecret) {
      return res.redirect(`${frontendUrl}/auth?error=google_oauth_not_configured`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Google token exchange failed:", await tokenResponse.text());
      return res.redirect(`${frontendUrl}/auth?error=google_token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Get user info from Google
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      return res.redirect(`${frontendUrl}/auth?error=google_userinfo_failed`);
    }

    const googleUser = await userInfoResponse.json();
    const { email, given_name, family_name, picture } = googleUser;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists, log them in
      if (!user.isActive) {
        // Activate Google OAuth users automatically
        user.isActive = true;
        user.emailVerified = true;
        await user.save();
      }
    } else {
      // Create new user
      // Split name if given_name is not available
      const firstName = given_name || email.split("@")[0];
      const lastName = family_name || "";

      user = new User({
        firstName,
        lastName,
        email,
        password: `google_oauth_${Date.now()}`, // Dummy password for OAuth users
        isActive: true,
        emailVerified: true,
      });

      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Redirect to frontend with token
    res.redirect(`${frontendUrl}/auth?token=${token}&google_auth=success`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/auth?error=google_auth_error`);
  }
});

export default router;