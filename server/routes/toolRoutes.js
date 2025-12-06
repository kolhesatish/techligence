import express from "express";
import { body, validationResult } from "express-validator";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import Tool from "../models/Tool.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";
import { uploadImageToSupabase } from "../services/supabaseService.js";
import mongoose from "mongoose";

const router = express.Router();

// Configure multer for file uploads (memory storage)
const storage = multer.memoryStorage();

// Multer for HTML file uploads
const uploadHtml = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for HTML files
  },
  fileFilter: (req, file, cb) => {
    // Accept only HTML files
    if (file.mimetype === 'text/html' || file.originalname.endsWith('.html')) {
      cb(null, true);
    } else {
      cb(new Error('Only HTML files are allowed'), false);
    }
  },
});

// Multer for image uploads
const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for images
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// --- Public Routes ---

// GET / - Get all published tools
router.get("/", async (req, res) => {
  try {
    const tools = await Tool.find({ status: "published" })
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      message: "Tools fetched successfully!",
      data: tools,
    });
  } catch (error) {
    console.error("Error fetching tools:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tools",
      error: error.message,
    });
  }
});

// --- Admin-Only Routes (must be before /:slug to avoid route conflicts) ---

// GET /all - Get all tools including drafts (Admin only)
// IMPORTANT: This route must be before /:slug route to avoid matching "all" as a slug
router.get(
  "/all",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const tools = await Tool.find({})
        .populate("createdBy", "firstName lastName email")
        .sort({ createdAt: -1 });
      
      res.json({
        success: true,
        message: "All tools fetched successfully!",
        data: tools,
      });
    } catch (error) {
      console.error("Error fetching all tools:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch tools",
        error: error.message,
      });
    }
  }
);

// GET /:slug - Get a single tool by slug (Public route)
// This route should be after /all to avoid matching "all" as a slug
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Don't treat "all" as a slug - it should be handled by the /all route above
    if (slug === "all") {
      return res.status(404).json({
        success: false,
        message: "Tool not found",
      });
    }
    
    const tool = await Tool.findOne({ slug, status: "published" })
      .populate("createdBy", "firstName lastName email");

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: "Tool not found",
      });
    }

    res.json({
      success: true,
      message: "Tool fetched successfully!",
      data: tool,
    });
  } catch (error) {
    console.error("Error fetching tool by slug:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tool",
      error: error.message,
    });
  }
});

// POST / - Create a new tool (Admin only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("htmlContent").notEmpty().withMessage("HTML content is required"),
    body("status")
      .optional()
      .isIn(["draft", "published"])
      .withMessage("Status must be either draft or published"),
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

      const { title, description, htmlContent, status, icon, image, category } = req.body;
      
      // Generate slug from title if not provided
      let slug = req.body.slug || generateSlug(title);
      
      // Ensure slug is unique
      let slugExists = await Tool.findOne({ slug });
      let counter = 1;
      while (slugExists) {
        slug = `${generateSlug(title)}-${counter}`;
        slugExists = await Tool.findOne({ slug });
        counter++;
      }

      const tool = new Tool({
        title: title.trim(),
        slug,
        description: description.trim(),
        htmlContent,
        status: status || "draft",
        icon: icon || "🔧",
        image: image || null,
        category: category || null,
        createdBy: req.userId,
      });

      await tool.save();
      
      const populatedTool = await Tool.findById(tool._id)
        .populate("createdBy", "firstName lastName email");

      res.status(201).json({
        success: true,
        message: "Tool created successfully!",
        data: populatedTool,
      });
    } catch (error) {
      console.error("Error creating tool:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create tool",
        error: error.message,
      });
    }
  }
);

// POST /upload-image - Upload tool image to Supabase (Admin only)
router.post(
  "/upload-image",
  authenticateToken,
  authorizeRoles("admin"),
  uploadImage.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      // Generate unique filename
      const fileExtension = req.file.originalname.split(".").pop();
      const fileName = `tools/${uuidv4()}-${Date.now()}.${fileExtension}`;

      // Upload to Supabase (using 'tool-images' bucket)
      const uploadResult = await uploadImageToSupabase(req.file, fileName, "tool-images");

      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          message: uploadResult.error || "Failed to upload image to Supabase",
        });
      }

      res.json({
        success: true,
        message: "Image uploaded successfully",
        data: {
          url: uploadResult.url,
        },
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload image",
        error: error.message,
      });
    }
  }
);

// POST /upload-html - Upload HTML file and extract content (Admin only)
router.post(
  "/upload-html",
  authenticateToken,
  authorizeRoles("admin"),
  uploadHtml.single("htmlFile"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No HTML file provided",
        });
      }

      // Extract HTML content from uploaded file
      const htmlContent = req.file.buffer.toString("utf-8");

      res.json({
        success: true,
        message: "HTML file uploaded and processed successfully!",
        data: {
          htmlContent,
          fileName: req.file.originalname,
          fileSize: req.file.size,
        },
      });
    } catch (error) {
      console.error("Error uploading HTML file:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload HTML file",
        error: error.message,
      });
    }
  }
);

// PUT /:id - Update a tool (Admin only)
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  [
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("description").optional().trim().notEmpty().withMessage("Description cannot be empty"),
    body("status")
      .optional()
      .isIn(["draft", "published"])
      .withMessage("Status must be either draft or published"),
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate MongoDB ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid tool ID format",
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const tool = await Tool.findById(id);
      
      if (!tool) {
        return res.status(404).json({
          success: false,
          message: "Tool not found",
        });
      }

      // Update fields
      if (req.body.title) {
        tool.title = req.body.title.trim();
        
        // Update slug if title changed and slug not explicitly provided
        if (!req.body.slug) {
          let newSlug = generateSlug(req.body.title);
          let slugExists = await Tool.findOne({ slug: newSlug, _id: { $ne: id } });
          let counter = 1;
          while (slugExists) {
            newSlug = `${generateSlug(req.body.title)}-${counter}`;
            slugExists = await Tool.findOne({ slug: newSlug, _id: { $ne: id } });
            counter++;
          }
          tool.slug = newSlug;
        }
      }
      
      if (req.body.slug) {
        // Validate slug is unique
        const slugExists = await Tool.findOne({ slug: req.body.slug, _id: { $ne: id } });
        if (slugExists) {
          return res.status(400).json({
            success: false,
            message: "Slug already exists",
          });
        }
        tool.slug = req.body.slug.trim().toLowerCase();
      }
      
      if (req.body.description !== undefined) {
        tool.description = req.body.description.trim();
      }
      
      if (req.body.htmlContent !== undefined) {
        tool.htmlContent = req.body.htmlContent;
      }
      
      if (req.body.status) {
        tool.status = req.body.status;
      }
      
      if (req.body.icon !== undefined) {
        tool.icon = req.body.icon.trim();
      }
      
      if (req.body.image !== undefined) {
        tool.image = req.body.image?.trim() || null;
      }
      
      if (req.body.category !== undefined) {
        tool.category = req.body.category?.trim() || null;
      }

      await tool.save();
      
      const populatedTool = await Tool.findById(tool._id)
        .populate("createdBy", "firstName lastName email");

      res.json({
        success: true,
        message: "Tool updated successfully!",
        data: populatedTool,
      });
    } catch (error) {
      console.error("Error updating tool:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update tool",
        error: error.message,
      });
    }
  }
);

// DELETE /:id - Delete a tool (Admin only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate MongoDB ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid tool ID format",
        });
      }

      const tool = await Tool.findByIdAndDelete(id);
      
      if (!tool) {
        return res.status(404).json({
          success: false,
          message: "Tool not found",
        });
      }

      res.json({
        success: true,
        message: "Tool deleted successfully!",
        data: tool,
      });
    } catch (error) {
      console.error("Error deleting tool:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete tool",
        error: error.message,
      });
    }
  }
);

export default router;

