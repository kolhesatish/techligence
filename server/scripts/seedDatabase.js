import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://atharvasakpal14:Y7kTXI6g5FAa0vWf@cluster0.a3ccsff.mongodb.net/techligence-test";

const seedUsers = [
  {
    firstName: "John",
    lastName: "Doe",
    email: "john@robotech.com",
    password: "Password123", // Will be hashed by pre-save hook
    role: "admin",
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@robotech.com",
    password: "Password123",
    role: "engineer",
  },
  {
    firstName: "Bob",
    lastName: "Wilson",
    email: "bob@robotech.com",
    password: "Password123",
    role: "user",
  },
];

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting user database seeding...");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing users
    console.log("🗑️  Clearing existing users...");
    await User.deleteMany({});

    // Create new users
    console.log("👤 Creating users...");
    const createdUsers = await User.create(seedUsers);
    console.log(`Created ${createdUsers.length} users`);

    console.log("\n🔑 Test Accounts:");
    createdUsers.forEach((user) => {
      console.log(`   📧 ${user.email} (${user.role})`);
      console.log(`   Password: Password123`);
    });

    await mongoose.connection.close();
    console.log("📴 Database connection closed");
    console.log("🎉 User seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;
