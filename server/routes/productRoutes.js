import express from "express";
import { body, validationResult } from "express-validator";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import Product from "../models/Products.js"; // Adjust path to your Product Mongoose model
import { authenticateToken, authorizeRoles } from "../middleware/auth.js"; // Your authentication and authorization middleware
import { updateSingleContentItem } from "../utils/contentIngestor.js"; // NEW: Import contentIngestor for RAG updates
import { uploadImageToSupabase } from "../services/supabaseService.js"; // Import Supabase service

const router = express.Router();

// Configure multer for file uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
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

// --- Public Routes (e.g., for general product listing) ---

// GET / - Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({}); // Fetch all products
    res.json({
      success: true,
      message: "Products fetched successfully!",
      data: products,
    });
  } catch (error) {
    console.error("Error fetching all products:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products", error: error.message });
  }
});

// GET /by-id/:id - Get a single product by MongoDB _id (Public route)
router.get("/by-id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product fetched successfully!",
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product by _id:", error);
    res.status(500).json({ success: false, message: "Failed to fetch product", error: error.message });
  }
});

// --- Admin-Only Routes ---

// POST /upload-image - Upload product image to Supabase (Admin only)
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
      const fileName = `products/${uuidv4()}-${Date.now()}.${fileExtension}`;

      // Upload to Supabase
      const uploadResult = await uploadImageToSupabase(req.file, fileName);

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
      console.error("Error uploading image:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload image",
        error: error.message
      });
    }
  }
);

// GET /:productId - Get a single product by ID (for admin editing)
router.get(
  "/:productId",
  authenticateToken,
  authorizeRoles('admin'), // Only admins can fetch product details for editing
  async (req, res) => {
    try {
      const { productId } = req.params;

      const product = await Product.findOne({ productId: productId });

      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      res.json({
        success: true,
        message: "Product fetched successfully!",
        data: product,
      });
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      res.status(500).json({ success: false, message: "Failed to fetch product", error: error.message });
    }
  }
);


// POST / - Add a new product (Admin only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles('admin'), // Only admins can add products
  [
    // Validation rules for each field based on your productSchema
    body("productId")
      .isNumeric().withMessage("Product ID must be a number")
      .notEmpty().withMessage("Product ID is required")
      .custom(async (value) => { // Custom validation to check for existing productId
        const existingProduct = await Product.findOne({ productId: value });
        if (existingProduct) {
          throw new Error("Product with this ID already exists.");
        }
      }),
    body("name").notEmpty().withMessage("Product name is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("price").notEmpty().withMessage("Price is required"),
    body("priceValue").isNumeric().withMessage("Price value must be a number").notEmpty(),
    body("originalPrice").optional().isString().withMessage("Original price must be a string"),
    body("image")
      .notEmpty().withMessage("Image is required")
      .custom((value) => {
        // Accept Supabase URLs or regular URLs
        if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('https'))) {
          return true;
        }
        throw new Error("Image must be a valid URL (Supabase or other)");
      }),
    body("category").notEmpty().withMessage("Category is required"),
    body("rating").isFloat({ min: 0, max: 5 }).optional().withMessage("Rating must be between 0 and 5"),
    body("reviews").isInt({ min: 0 }).optional().withMessage("Reviews must be a non-negative integer"),
    body("inStock").isBoolean().optional().withMessage("In stock must be a boolean"),
    body("stockCount").isInt({ min: 0 }).optional().withMessage("Stock count must be a non-negative integer"),
    body("shippingTime").optional().isString().withMessage("Shipping time must be a string"),
    body("warranty").optional().isString().withMessage("Warranty must be a string"),
    // Validation for nested specifications object
    body("specifications.speed").optional().isString().withMessage("Speed must be a string"),
    body("specifications.payload").optional().isString().withMessage("Payload must be a string"),
    body("specifications.range").optional().isString().withMessage("Range must be a string"),
    body("specifications.battery").optional().isString().withMessage("Battery must be a string"),
    // Validation for features array
    body("features").optional().isArray().withMessage("Features must be an array of strings"),
    body("features.*").optional().isString().withMessage("Each feature must be a string"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    try {
      const newProduct = new Product(req.body);
      await newProduct.save();

      // NEW: Post-save hook for RAG (optional - don't fail if Pinecone is not configured)
      try {
        await updateSingleContentItem('product', newProduct, 'upsert');
      } catch (pineconeError) {
        console.warn(" Pinecone update failed (non-critical):", pineconeError.message);
        // Continue even if Pinecone update fails
      }

      res.status(201).json({
        success: true,
        message: "Product added successfully!",
        data: newProduct,
      });
    } catch (error) {
      console.error("Error adding product:", error);
      res.status(500).json({ success: false, message: "Failed to add product", error: error.message });
    }
  }
);

// PUT /:productId - Update an existing product (Admin only)
router.put(
  "/:productId",
  authenticateToken,
  authorizeRoles('admin'),
  [
    // Validation rules for fields that can be updated
    body("name").optional().notEmpty().withMessage("Product name cannot be empty"),
    body("description").optional().notEmpty().withMessage("Description cannot be empty"),
    body("price").optional().notEmpty().withMessage("Price cannot be empty"),
    body("priceValue").optional().isNumeric().withMessage("Price value must be a number"),
    body("originalPrice").optional().isString().withMessage("Original price must be a string"),
    body("image")
      .optional()
      .notEmpty().withMessage("Image cannot be empty")
      .custom((value) => {
        // Accept Supabase URLs or regular URLs
        if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('https'))) {
          return true;
        }
        throw new Error("Image must be a valid URL (Supabase or other)");
      }),
    body("category").optional().notEmpty().withMessage("Category cannot be empty"),
    body("rating").optional().isFloat({ min: 0, max: 5 }).withMessage("Rating must be between 0 and 5"),
    body("reviews").optional().isInt({ min: 0 }).withMessage("Reviews must be a non-negative integer"),
    body("inStock").optional().isBoolean().withMessage("In stock must be a boolean"),
    body("stockCount").optional().isInt({ min: 0 }).withMessage("Stock count must be a non-negative integer"),
    body("shippingTime").optional().isString().withMessage("Shipping time must be a string"),
    body("warranty").optional().isString().withMessage("Warranty must be a string"),
    // Validation for nested specifications object
    body("specifications.speed").optional().isString().withMessage("Speed must be a string"),
    body("specifications.payload").optional().isString().withMessage("Payload must be a string"),
    body("specifications.range").optional().isString().withMessage("Range must be a string"),
    body("specifications.battery").optional().isString().withMessage("Battery must be a string"),
    // Validation for features array
    body("features").optional().isArray().withMessage("Features must be an array of strings"),
    body("features.*").optional().isString().withMessage("Each feature must be a string"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    try {
      const { productId } = req.params;
      const updates = req.body;

      if (updates.productId && updates.productId !== parseInt(productId)) {
        return res.status(400).json({ success: false, message: "Product ID in URL does not match ID in body." });
      }
      delete updates.productId;

      const updatedProduct = await Product.findOneAndUpdate(
        { productId: parseInt(productId) },
        updates,
        { new: true, runValidators: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      // NEW: Post-update hook for RAG (optional - don't fail if Pinecone is not configured)
      try {
        await updateSingleContentItem('product', updatedProduct, 'upsert');
      } catch (pineconeError) {
        console.warn(" Pinecone update failed (non-critical):", pineconeError.message);
        // Continue even if Pinecone update fails
      }

      res.json({
        success: true,
        message: "Product updated successfully!",
        data: updatedProduct,
      });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ success: false, message: "Failed to update product", error: error.message });
    }
  }
);

// DELETE /:productId - Delete a product (Admin only)
router.delete(
  "/:productId",
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { productId } = req.params;

      const deletedProduct = await Product.findOneAndDelete({ productId: parseInt(productId) });

      if (!deletedProduct) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      // NEW: Post-delete hook for RAG (optional - don't fail if Pinecone is not configured)
      try {
        await updateSingleContentItem('product', deletedProduct, 'delete');
      } catch (pineconeError) {
        console.warn(" Pinecone delete failed (non-critical):", pineconeError.message);
        // Continue even if Pinecone delete fails
      }


      res.json({
        success: true,
        message: "Product deleted successfully!",
        data: null,
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ success: false, message: "Failed to delete product", error: error.message });
    }
  }
);

export default router;
