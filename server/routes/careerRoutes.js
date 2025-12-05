import express from "express";
import { body, validationResult } from "express-validator";
import JobListing from "../models/JobListing.js"; // Adjust path to your JobListing Mongoose model
import JobApplication from "../models/JobApplication.js"; // Import JobApplication model
import { authenticateToken, authorizeRoles } from "../middleware/auth.js"; // Import auth and authorize middleware
import { updateSingleContentItem } from "../utils/contentIngestor.js"; // NEW: Import contentIngestor for RAG updates
import { uploadResumeToSupabase } from "../services/supabaseService.js"; // Import Supabase service for resume uploads
import multer from "multer"; // For handling file uploads (resumes)
import { v4 as uuidv4 } from "uuid"; // For unique file names
import path from "path"; // For file extensions

const router = express.Router();

// --- Multer setup for resume uploads (Cloud Storage Recommended for Render) ---
// Using memoryStorage to handle the file as a buffer in memory before uploading to a cloud service.
// This avoids saving files to Render's ephemeral disk, which will be lost on deploys or restarts.
const storage = multer.memoryStorage();

// Filter for allowed file types (PDF, DOC, DOCX)
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
});


// --- Public Routes ---

// GET /api/career/jobs - Get all job listings
router.get("/jobs", async (req, res) => {
  try {
    const jobListings = await JobListing.find({});
    res.json({
      success: true,
      message: "Job listings fetched successfully!",
      data: jobListings,
    });
  } catch (error) {
    console.error("Error fetching all job listings:", error);
    res.status(500).json({ success: false, message: "Failed to fetch job listings", error: error.message });
  }
});

// GET /api/career/jobs/:jobId - Get a single job listing by ID
router.get("/jobs/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobListing = await JobListing.findById(jobId);

    if (!jobListing) {
      return res.status(404).json({ 
        success: false, 
        message: "Job listing not found." 
      });
    }

    res.json({
      success: true,
      message: "Job listing fetched successfully!",
      data: jobListing,
    });
  } catch (error) {
    console.error("Error fetching job listing by ID:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch job listing", 
      error: error.message 
    });
  }
});

// POST /api/career/apply - Submit a job application
router.post(
  "/apply",
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'portfolio', maxCount: 1 }
  ]),
  [
    body("firstName").notEmpty().withMessage("First name is required."),
    body("lastName").notEmpty().withMessage("Last name is required."),
    body("email").isEmail().withMessage("Valid email is required."),
    body("phone").notEmpty().withMessage("Phone number is required."),
    body("jobTitle").notEmpty().withMessage("Job title is required."),
    body("jobDepartment").notEmpty().withMessage("Job department is required."),
    body("jobLocation").notEmpty().withMessage("Job location is required."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    const resumeFile = req.files?.resume?.[0];
    const portfolioFile = req.files?.portfolio?.[0];

    if (!resumeFile) {
      return res.status(400).json({ success: false, message: "Resume file is required." });
    }

    try {
      // Find the job listing - prefer jobId if provided, otherwise match by title/department/location
      let jobListing;
      if (req.body.jobId) {
        jobListing = await JobListing.findOne({
          _id: req.body.jobId,
          isActive: true
        });
      } else {
        jobListing = await JobListing.findOne({
          title: req.body.jobTitle,
          department: req.body.jobDepartment,
          location: req.body.jobLocation,
          isActive: true
        });
      }

      if (!jobListing) {
        return res.status(404).json({ 
          success: false, 
          message: "Job listing not found. Please ensure the job is still available." 
        });
      }

      // Generate unique file name for resume
      const resumeExtension = path.extname(resumeFile.originalname);
      const resumeFileName = `resume-${uuidv4()}${resumeExtension}`;

      // Upload resume to Supabase
      const resumeUploadResult = await uploadResumeToSupabase(resumeFile, resumeFileName, 'resumes');
      
      if (!resumeUploadResult.success) {
        return res.status(500).json({ 
          success: false, 
          message: "Failed to upload resume", 
          error: resumeUploadResult.error 
        });
      }

      // Upload portfolio to Supabase if provided
      let portfolioUrl = null;
      if (portfolioFile) {
        const portfolioExtension = path.extname(portfolioFile.originalname);
        const portfolioFileName = `portfolio-${uuidv4()}${portfolioExtension}`;
        const portfolioUploadResult = await uploadResumeToSupabase(portfolioFile, portfolioFileName, 'resumes');
        
        if (portfolioUploadResult.success) {
          portfolioUrl = portfolioUploadResult.url;
        } else {
          console.warn("Portfolio upload failed, but continuing with application:", portfolioUploadResult.error);
        }
      }

      // Create application data object
      const applicationData = {
        // Personal Information
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address || "",
        city: req.body.city || "",
        state: req.body.state || "",
        zipCode: req.body.zipCode || "",

        // Professional Information
        currentTitle: req.body.currentTitle || "",
        currentCompany: req.body.currentCompany || "",
        totalExperience: req.body.totalExperience || "",
        relevantExperience: req.body.relevantExperience || "",
        expectedSalary: req.body.expectedSalary || "",
        noticePeriod: req.body.noticePeriod || "",

        // Education
        education: req.body.education || "",
        university: req.body.university || "",
        graduationYear: req.body.graduationYear || "",

        // Application Details
        jobTitle: req.body.jobTitle,
        jobDepartment: req.body.jobDepartment,
        jobLocation: req.body.jobLocation,
        jobId: jobListing._id,
        coverLetter: req.body.coverLetter || "",
        whyJoin: req.body.whyJoin || "",
        availability: req.body.availability || "",
        relocate: req.body.relocate === 'true' || req.body.relocate === true,

        // Files
        resumeUrl: resumeUploadResult.url,
        portfolioUrl: portfolioUrl,
      };

      // Save application to MongoDB
      const savedApplication = await JobApplication.create(applicationData);

      console.log("Job Application Saved Successfully:", savedApplication._id);

      res.status(200).json({
        success: true,
        message: "Your job application has been submitted successfully!",
        data: {
          applicationId: savedApplication._id,
          submittedAt: savedApplication.createdAt
        }
      });
    } catch (error) {
      console.error("Error submitting job application:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to submit application", 
        error: error.message 
      });
    }
  }
);


// --- Admin-Only Routes (for managing job listings) ---

// POST /api/career/jobs - Add a new job listing (Admin only)
router.post(
  "/jobs",
  authenticateToken,
  authorizeRoles('admin'),
  [
    body("title").notEmpty().withMessage("Job title is required."),
    body("department").notEmpty().withMessage("Department is required."),
    body("location").notEmpty().withMessage("Location is required."),
    body("type").notEmpty().withMessage("Job type is required."),
    body("salary").notEmpty().withMessage("Salary is required."),
    body("description").notEmpty().withMessage("Description is required."),
    body("skills").isArray().withMessage("Skills must be an array."),
    body("skills.*").notEmpty().withMessage("Each skill cannot be empty."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    try {
      const newJob = new JobListing(req.body);
      await newJob.save();

      // NEW: Post-save hook for RAG (non-blocking - don't fail job creation if embedding fails)
      try {
        await updateSingleContentItem('job_listing', newJob, 'upsert');
      } catch (ragError) {
        console.warn("Warning: Failed to update RAG index for job listing (non-critical):", ragError.message);
        // Continue - job was created successfully, RAG update is optional
      }

      res.status(201).json({
        success: true,
        message: "Job listing added successfully!",
        data: newJob,
      });
    } catch (error) {
      console.error("Error adding job listing:", error);
      res.status(500).json({ success: false, message: "Failed to add job listing", error: error.message });
    }
  }
);

// PUT /api/career/jobs/:jobId - Update a job listing (Admin only)
router.put(
  "/jobs/:jobId",
  authenticateToken,
  authorizeRoles('admin'),
  [
    body("title").optional().notEmpty().withMessage("Job title cannot be empty."),
    body("department").optional().notEmpty().withMessage("Department cannot be empty."),
    body("location").optional().notEmpty().withMessage("Location cannot be empty."),
    body("type").optional().notEmpty().withMessage("Job type cannot be empty."),
    body("salary").optional().notEmpty().withMessage("Salary cannot be empty."),
    body("description").optional().notEmpty().withMessage("Description cannot be empty."),
    body("skills").optional().isArray().withMessage("Skills must be an array."),
    body("skills.*").optional().notEmpty().withMessage("Each skill cannot be empty."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    try {
      const { jobId } = req.params;
      const updatedJob = await JobListing.findByIdAndUpdate(jobId, req.body, { new: true, runValidators: true });

      if (!updatedJob) {
        return res.status(404).json({ success: false, message: "Job listing not found." });
      }

      // NEW: Post-update hook for RAG (non-blocking - don't fail job update if embedding fails)
      try {
        await updateSingleContentItem('job_listing', updatedJob, 'upsert');
      } catch (ragError) {
        console.warn("Warning: Failed to update RAG index for job listing (non-critical):", ragError.message);
        // Continue - job was updated successfully, RAG update is optional
      }

      res.json({
        success: true,
        message: "Job listing updated successfully!",
        data: updatedJob,
      });
    } catch (error) {
      console.error("Error updating job listing:", error);
      res.status(500).json({ success: false, message: "Failed to update job listing", error: error.message });
    }
  }
);

// DELETE /api/career/jobs/:jobId - Delete a job listing (Admin only)
router.delete(
  "/jobs/:jobId",
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { jobId } = req.params;
      const deletedJob = await JobListing.findByIdAndDelete(jobId);

      if (!deletedJob) {
        return res.status(404).json({ success: false, message: "Job listing not found." });
      }

      // NEW: Post-delete hook for RAG (non-blocking)
      try {
        await updateSingleContentItem('job_listing', deletedJob, 'delete');
      } catch (ragError) {
        console.warn("Warning: Failed to update RAG index for job deletion (non-critical):", ragError.message);
        // Continue - job was deleted successfully, RAG update is optional
      }

      res.json({
        success: true,
        message: "Job listing deleted successfully!",
        data: null,
      });
    } catch (error) {
      console.error("Error deleting job listing:", error);
      res.status(500).json({ success: false, message: "Failed to delete job listing", error: error.message });
    }
  }
);

// GET /api/career/applications - Get all job applications (Admin only)
router.get(
  "/applications",
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { jobId, status } = req.query;
      
      // Build query
      const query = {};
      if (jobId) {
        query.jobId = jobId;
      }
      if (status) {
        query.status = status;
      }

      // Fetch applications with job listing details
      const applications = await JobApplication.find(query)
        .populate('jobId', 'title department location type')
        .sort({ createdAt: -1 }); // Most recent first

      res.json({
        success: true,
        message: "Applications fetched successfully!",
        data: applications,
        count: applications.length,
      });
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch applications", 
        error: error.message 
      });
    }
  }
);

// GET /api/career/applications/:applicationId - Get a single application (Admin only)
router.get(
  "/applications/:applicationId",
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const application = await JobApplication.findById(applicationId)
        .populate('jobId', 'title department location type description skills');

      if (!application) {
        return res.status(404).json({ 
          success: false, 
          message: "Application not found." 
        });
      }

      res.json({
        success: true,
        message: "Application fetched successfully!",
        data: application,
      });
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch application", 
        error: error.message 
      });
    }
  }
);

// PUT /api/career/applications/:applicationId/status - Update application status (Admin only)
router.put(
  "/applications/:applicationId/status",
  authenticateToken,
  authorizeRoles('admin'),
  [
    body("status").isIn(["pending", "reviewed", "shortlisted", "rejected", "accepted"])
      .withMessage("Invalid status. Must be one of: pending, reviewed, shortlisted, rejected, accepted"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: "Validation failed", 
        errors: errors.array() 
      });
    }

    try {
      const { applicationId } = req.params;
      const { status, adminNotes } = req.body;

      const updateData = { status };
      if (adminNotes !== undefined) {
        updateData.adminNotes = adminNotes;
      }

      const updatedApplication = await JobApplication.findByIdAndUpdate(
        applicationId,
        updateData,
        { new: true, runValidators: true }
      ).populate('jobId', 'title department location');

      if (!updatedApplication) {
        return res.status(404).json({ 
          success: false, 
          message: "Application not found." 
        });
      }

      res.json({
        success: true,
        message: "Application status updated successfully!",
        data: updatedApplication,
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to update application status", 
        error: error.message 
      });
    }
  }
);

export default router;
