import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/techligence";

const makeUserAdmin = async (email) => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log(" Connected to MongoDB");

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    user.role = "admin";
    user.isActive = true;
    user.emailVerified = true;
    await user.save();

    console.log(` User ${email} has been set as admin`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Verified: ${user.emailVerified}`);

    await mongoose.connection.close();
    console.log("📴 Database connection closed");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error("Please provide an email address");
  console.log("Usage: node scripts/makeAdmin.js user@example.com");
  process.exit(1);
}

makeUserAdmin(email);

