import express from "express";
import { body, validationResult } from "express-validator";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import BlogPost from "../models/BlogPost.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js"; // Import auth and authorize middleware
import { updateSingleContentItem } from "../utils/contentIngestor.js"; // NEW: Import contentIngestor for RAG updates
import { uploadImageToSupabase, deleteImageFromSupabase } from "../services/supabaseService.js"; // Import Supabase service

const router = express.Router();

// Helper function to extract image URLs from HTML content
const extractImageUrlsFromContent = (htmlContent) => {
  if (!htmlContent) return [];
  
  const imageUrls = [];
  // Match all <img> tags with src attributes
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  
  while ((match = imgRegex.exec(htmlContent)) !== null) {
    const url = match[1];
    if (url && !url.startsWith('data:')) { // Exclude base64 images
      imageUrls.push(url);
    }
  }
  
  return imageUrls;
};

// Helper function to extract Supabase Storage path from URL
const extractSupabasePath = (url) => {
  if (!url) return null;
  
  try {
    // Supabase Storage URLs typically look like:
    // https://[project-id].supabase.co/storage/v1/object/public/blog-images/path/to/file.jpg
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    
    if (pathMatch) {
      return {
        bucket: pathMatch[1],
        path: pathMatch[2]
      };
    }
    
    // Alternative format: direct path in URL
    if (url.includes('blog-images')) {
      const parts = url.split('blog-images/');
      if (parts.length > 1) {
        return {
          bucket: 'blog-images',
          path: parts[1].split('?')[0] // Remove query parameters
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing image URL:', url, error);
    return null;
  }
};

// Helper function to delete all blog images
const deleteBlogImages = async (blogPost) => {
  const imagesToDelete = [];
  
  // Extract images from content
  if (blogPost.content) {
    const contentImages = extractImageUrlsFromContent(blogPost.content);
    contentImages.forEach(url => {
      const pathInfo = extractSupabasePath(url);
      if (pathInfo && pathInfo.bucket === 'blog-images') {
        imagesToDelete.push(pathInfo);
      }
    });
  }
  
  // Extract featured image if it's a Supabase URL
  if (blogPost.image) {
    const pathInfo = extractSupabasePath(blogPost.image);
    if (pathInfo && pathInfo.bucket === 'blog-images') {
      imagesToDelete.push(pathInfo);
    }
  }
  
  // Delete all images (non-blocking - don't fail if deletion fails)
  const deletePromises = imagesToDelete.map(async (pathInfo) => {
    try {
      const result = await deleteImageFromSupabase(pathInfo.path, pathInfo.bucket);
      if (result.success) {
        console.log(`Deleted image: ${pathInfo.path} from ${pathInfo.bucket}`);
      } else {
        console.warn(`Failed to delete image: ${pathInfo.path}`, result.error);
      }
    } catch (error) {
      console.warn(`Error deleting image ${pathInfo.path}:`, error.message);
    }
  });
  
  await Promise.allSettled(deletePromises);
  console.log(`Attempted to delete ${imagesToDelete.length} images for blog post: ${blogPost.slug || blogPost.postId}`);
};

// Configure multer for file uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// --- Public Routes (visible to all users) ---

// GET / - Get all blog posts (when mounted at /api/blogposts)
// Public route: only returns published posts (published !== false)
router.get("/", async (req, res) => {
  try {
    // Only fetch published posts for public access
    const blogPosts = await BlogPost.find({ 
      $or: [{ published: { $exists: false } }, { published: true }] 
    }).sort({ publishedDate: -1 }); // Fetch published posts, sorted by date
    res.json({
      success: true,
      message: "Blog posts fetched successfully!",
      data: blogPosts,
    });
  } catch (error) {
    console.error("Error fetching all blog posts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch blog posts", error: error.message });
  }
});

// GET /slug/:slug - Get a single blog post by slug (preferred method)
router.get("/slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const blogPost = await BlogPost.findOne({ 
      slug: slug,
      $or: [{ published: { $exists: false } }, { published: true }] 
    });

    if (!blogPost) {
      return res.status(404).json({ success: false, message: "Blog post not found" });
    }

    res.json({
      success: true,
      message: "Blog post fetched successfully!",
      data: blogPost,
    });
  } catch (error) {
    console.error("Error fetching blog post by slug:", error);
    res.status(500).json({ success: false, message: "Failed to fetch blog post", error: error.message });
  }
});

// GET /id/:postId - Get a single blog post by postId (backward compatibility)
router.get("/id/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const blogPost = await BlogPost.findOne({ 
      postId: parseInt(postId),
      $or: [{ published: { $exists: false } }, { published: true }] 
    });

    if (!blogPost) {
      return res.status(404).json({ success: false, message: "Blog post not found" });
    }

    res.json({
      success: true,
      message: "Blog post fetched successfully!",
      data: blogPost,
    });
  } catch (error) {
    console.error("Error fetching blog post by ID:", error);
    res.status(500).json({ success: false, message: "Failed to fetch blog post", error: error.message });
  }
});

// --- Admin-Only Routes (for CRUD operations) ---

// POST /upload-image - Upload blog image to Supabase (Admin only)
router.post(
  "/upload-image",
  authenticateToken,
  authorizeRoles('admin'),
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided"
        });
      }

      // Generate unique filename
      const fileExtension = req.file.originalname.split('.').pop();
      const fileName = `blog-images/${uuidv4()}-${Date.now()}.${fileExtension}`;

      // Upload to Supabase
      const uploadResult = await uploadImageToSupabase(req.file, fileName, 'blog-images');

      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          message: uploadResult.error || "Failed to upload image to Supabase"
        });
      }

      res.json({
        success: true,
        message: "Image uploaded successfully",
        data: {
          url: uploadResult.url
        }
      });
    } catch (error) {
      console.error("Error uploading blog image:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload image",
        error: error.message
      });
    }
  }
);

// GET /admin/all - Get all blog posts including drafts (Admin only)
router.get("/admin/all", authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const blogPosts = await BlogPost.find({}).sort({ publishedDate: -1 }); // Fetch all posts including drafts
    res.json({
      success: true,
      message: "All blog posts fetched successfully!",
      data: blogPosts,
    });
  } catch (error) {
    console.error("Error fetching all blog posts (admin):", error);
    res.status(500).json({ success: false, message: "Failed to fetch blog posts", error: error.message });
  }
});

// POST / - Add a new blog post (Admin only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles('admin'), // Only admins can add blog posts
  [
    // Validation rules for new blog post
    body("slug")
      .notEmpty().withMessage("Slug is required")
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage("Slug must be lowercase alphanumeric with hyphens"),
    body("title").notEmpty().withMessage("Title is required"),
    body("excerpt").notEmpty().withMessage("Excerpt is required"),
    body("author").notEmpty().withMessage("Author is required"),
    body("authorRole").notEmpty().withMessage("Author role is required"),
    body("publishedDate").isISO8601().toDate().withMessage("Valid published date is required"),
    body("readTime").notEmpty().withMessage("Read time is required"),
    body("category").isIn(["robotics", "ai", "technology", "tutorials", "industry", "innovation"]).withMessage("Invalid category"),
    body("image").notEmpty().withMessage("Image is required"),
    body("likes").isInt({ min: 0 }).optional().withMessage("Likes must be a non-negative integer"),
    body("comments").isInt({ min: 0 }).optional().withMessage("Comments must be a non-negative integer"),
    body("featured").isBoolean().optional().withMessage("Featured must be a boolean"),
    body("published").isBoolean().optional().withMessage("Published must be a boolean"),
    body("content").notEmpty().withMessage("Content is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    try {
      // Check if post with this slug already exists
      const existingPost = await BlogPost.findOne({ slug: req.body.slug });
      if (existingPost) {
        return res.status(409).json({ success: false, message: "Blog post with this slug already exists." });
      }

      const newPost = new BlogPost(req.body);
      await newPost.save();

      // NEW: Post-save hook for RAG (don't fail if RAG update fails)
      try {
        await updateSingleContentItem('blog', newPost, 'upsert');
      } catch (ragError) {
        console.warn("RAG update failed (non-critical):", ragError.message);
        // Continue even if RAG update fails - blog post is still created
      }

      res.status(201).json({ success: true, message: "Blog post created successfully!", data: newPost });
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ success: false, message: "Failed to create blog post", error: error.message });
    }
  }
);

// PUT /slug/:slug - Update an existing blog post by slug (Admin only)
router.put(
  "/slug/:slug",
  authenticateToken,
  authorizeRoles('admin'),
  [
    // Validation rules for updating blog post (all optional as it's an update)
    body("title").optional().notEmpty().withMessage("Title cannot be empty"),
    body("excerpt").optional().notEmpty().withMessage("Excerpt cannot be empty"),
    body("author").optional().notEmpty().withMessage("Author cannot be empty"),
    body("authorRole").optional().notEmpty().withMessage("Author role cannot be empty"),
    body("publishedDate").optional().isISO8601().toDate().withMessage("Valid published date is required"),
    body("readTime").optional().notEmpty().withMessage("Read time cannot be empty"),
    body("category").optional().isIn(["robotics", "ai", "technology", "tutorials", "industry", "innovation"]).withMessage("Invalid category"),
    body("image").optional().notEmpty().withMessage("Image cannot be empty"),
    body("likes").optional().isInt({ min: 0 }).withMessage("Likes must be a non-negative integer"),
    body("comments").optional().isInt({ min: 0 }).withMessage("Comments must be a non-negative integer"),
    body("featured").optional().isBoolean().withMessage("Featured must be a boolean"),
    body("published").optional().isBoolean().withMessage("Published must be a boolean"),
    body("content").optional().notEmpty().withMessage("Content cannot be empty"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    try {
      const { slug } = req.params;
      const updates = req.body;

      // Convert publishedDate to Date object if present
      if (updates.publishedDate) {
        updates.publishedDate = new Date(updates.publishedDate);
      }

      // Generate slug if it's missing in updates and title is provided
      if (!updates.slug && updates.title) {
        const generateSlug = (title) => {
          return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        };
        updates.slug = generateSlug(updates.title);
      }

      // Don't remove slug from updates - allow updating it if needed
      // But don't allow changing slug if it already exists (to prevent breaking URLs)
      const existingPost = await BlogPost.findOne({ slug: slug });
      if (existingPost && updates.slug && updates.slug !== slug) {
        // Check if new slug already exists
        const slugExists = await BlogPost.findOne({ slug: updates.slug, _id: { $ne: existingPost._id } });
        if (slugExists) {
          return res.status(409).json({ success: false, message: "Blog post with this slug already exists." });
        }
      }

      const updatedPost = await BlogPost.findOneAndUpdate(
        { slug: slug },
        updates,
        { new: true, runValidators: true }
      );

      if (!updatedPost) {
        return res.status(404).json({ success: false, message: "Blog post not found" });
      }

      // NEW: Post-update hook for RAG
      await updateSingleContentItem('blog', updatedPost, 'upsert');

      res.json({ success: true, message: "Blog post updated successfully!", data: updatedPost });
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ success: false, message: "Failed to update blog post", error: error.message });
    }
  }
);

// PUT /id/:postId - Update an existing blog post by postId (Admin only) - backward compatibility
router.put(
  "/id/:postId",
  authenticateToken,
  authorizeRoles('admin'),
  [
    // Validation rules for updating blog post (all optional as it's an update)
    body("title").optional().notEmpty().withMessage("Title cannot be empty"),
    body("excerpt").optional().notEmpty().withMessage("Excerpt cannot be empty"),
    body("author").optional().notEmpty().withMessage("Author cannot be empty"),
    body("authorRole").optional().notEmpty().withMessage("Author role cannot be empty"),
    body("publishedDate").optional().isISO8601().toDate().withMessage("Valid published date is required"),
    body("readTime").optional().notEmpty().withMessage("Read time cannot be empty"),
    body("category").optional().isIn(["robotics", "ai", "technology", "tutorials", "industry", "innovation"]).withMessage("Invalid category"),
    body("image").optional().notEmpty().withMessage("Image cannot be empty"),
    body("likes").optional().isInt({ min: 0 }).withMessage("Likes must be a non-negative integer"),
    body("comments").optional().isInt({ min: 0 }).withMessage("Comments must be a non-negative integer"),
    body("featured").optional().isBoolean().withMessage("Featured must be a boolean"),
    body("published").optional().isBoolean().withMessage("Published must be a boolean"),
    body("content").optional().notEmpty().withMessage("Content cannot be empty"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    try {
      const { postId } = req.params;
      const updates = req.body;

      // Convert publishedDate to Date object if present
      if (updates.publishedDate) {
        updates.publishedDate = new Date(updates.publishedDate);
      }

      // Remove postId from updates to prevent accidental changes if it's disabled on frontend for edit
      delete updates.postId;

      const updatedPost = await BlogPost.findOneAndUpdate(
        { postId: parseInt(postId) },
        updates,
        { new: true, runValidators: true }
      );

      if (!updatedPost) {
        return res.status(404).json({ success: false, message: "Blog post not found" });
      }

      // NEW: Post-update hook for RAG
      await updateSingleContentItem('blog', updatedPost, 'upsert');

      res.json({ success: true, message: "Blog post updated successfully!", data: updatedPost });
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ success: false, message: "Failed to update blog post", error: error.message });
    }
  }
);

// DELETE /slug/:slug - Delete a blog post by slug (Admin only)
router.delete(
    "/slug/:slug",
    authenticateToken,
    authorizeRoles('admin'),
    async (req, res) => {
      try {
        const { slug } = req.params;

        const deletedPost = await BlogPost.findOneAndDelete({ slug: slug });

        if (!deletedPost) {
          return res.status(404).json({ success: false, message: "Blog post not found" });
        }

        // NEW: Post-delete hook for RAG
        try {
          await updateSingleContentItem('blog', deletedPost, 'delete');
        } catch (ragError) {
          console.warn("RAG deletion failed (non-critical):", ragError.message);
          // Continue even if RAG deletion fails - blog post is still deleted
        }

        res.json({
          success: true,
          message: "Blog post deleted successfully!",
          data: null,
        });
      } catch (error) {
        console.error("Error deleting blog post:", error);
        res.status(500).json({ success: false, message: "Failed to delete blog post", error: error.message });
      }
    }
  );

// DELETE /id/:postId - Delete a blog post by postId (Admin only) - backward compatibility
router.delete(
    "/id/:postId",
    authenticateToken,
    authorizeRoles('admin'),
    async (req, res) => {
      try {
        const { postId } = req.params;

        const deletedPost = await BlogPost.findOneAndDelete({ postId: parseInt(postId) });

        if (!deletedPost) {
          return res.status(404).json({ success: false, message: "Blog post not found" });
        }

        // Delete all associated images from Supabase Storage
        try {
          await deleteBlogImages(deletedPost);
        } catch (imageError) {
          console.warn("Image deletion failed (non-critical):", imageError.message);
          // Continue even if image deletion fails - blog post is still deleted
        }

        // NEW: Post-delete hook for RAG
        try {
          await updateSingleContentItem('blog', deletedPost, 'delete');
        } catch (ragError) {
          console.warn("RAG deletion failed (non-critical):", ragError.message);
          // Continue even if RAG deletion fails - blog post is still deleted
        }

        res.json({
          success: true,
          message: "Blog post deleted successfully!",
          data: null,
        });
      } catch (error) {
        console.error("Error deleting blog post:", error);
        res.status(500).json({ success: false, message: "Failed to delete blog post", error: error.message });
      }
    }
  );

export default router;
