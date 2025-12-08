import mongoose from "mongoose";

// Define the Mongoose schema for a Job Application
const jobApplicationSchema = new mongoose.Schema(
  {
    // Personal Information
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },

    // Professional Information
    currentTitle: {
      type: String,
      trim: true,
    },
    currentCompany: {
      type: String,
      trim: true,
    },
    totalExperience: {
      type: String,
      trim: true,
    },
    relevantExperience: {
      type: String,
      trim: true,
    },
    expectedSalary: {
      type: String,
      trim: true,
    },
    noticePeriod: {
      type: String,
      trim: true,
    },

    // Education
    education: {
      type: String,
      trim: true,
    },
    university: {
      type: String,
      trim: true,
    },
    graduationYear: {
      type: String,
      trim: true,
    },

    // Application Details
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    jobDepartment: {
      type: String,
      required: true,
      trim: true,
    },
    jobLocation: {
      type: String,
      required: true,
      trim: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobListing",
      required: true,
    },
    coverLetter: {
      type: String,
      trim: true,
    },
    whyJoin: {
      type: String,
      trim: true,
    },
    availability: {
      type: String,
      trim: true,
    },
    relocate: {
      type: Boolean,
      default: false,
    },

    // Files - Resume URL from Supabase
    resumeUrl: {
      type: String,
      required: true,
    },
    portfolioUrl: {
      type: String,
    },

    // Application Status
    status: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected", "accepted"],
      default: "pending",
    },

    // Notes for admin
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create indexes for efficient queries
jobApplicationSchema.index({ jobId: 1 });
jobApplicationSchema.index({ email: 1 });
jobApplicationSchema.index({ status: 1 });
jobApplicationSchema.index({ createdAt: -1 });

// Create and export the JobApplication model
const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);
export default JobApplication;







