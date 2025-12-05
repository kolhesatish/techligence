import express from "express";
import ProductLike from "../models/ProductLike.js";
import { authenticateToken } from "../middleware/auth.js";
import mongoose from "mongoose";

const router = express.Router();

// GET /:productId - Get like count for a product (Public)
router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    const likeCount = await ProductLike.countDocuments({ productId });

    res.json({
      success: true,
      data: {
        likeCount,
        productId,
      },
    });
  } catch (error) {
    console.error("Error fetching like count:", error);
    res.status(500).json({ success: false, message: "Failed to fetch like count", error: error.message });
  }
});

// GET /:productId/status - Check if current user has liked the product (Requires auth)
router.get("/:productId/status", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in request",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    // Convert to ObjectId
    const productObjectId = new mongoose.Types.ObjectId(productId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const like = await ProductLike.findOne({ productId: productObjectId, userId: userObjectId });
    const isLiked = !!like;

    res.json({
      success: true,
      data: {
        isLiked,
        productId,
      },
    });
  } catch (error) {
    console.error("Error checking like status:", error);
    res.status(500).json({ success: false, message: "Failed to check like status", error: error.message });
  }
});

// POST /:productId - Toggle like for a product (Requires auth)
router.post("/:productId", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.userId || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in request",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    // Convert to ObjectId
    const productObjectId = new mongoose.Types.ObjectId(productId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Check if like already exists
    const existingLike = await ProductLike.findOne({ productId: productObjectId, userId: userObjectId });

    if (existingLike) {
      // Unlike: remove the like
      await ProductLike.findByIdAndDelete(existingLike._id);
      const likeCount = await ProductLike.countDocuments({ productId: productObjectId });

      res.json({
        success: true,
        message: "Product unliked successfully",
        data: {
          isLiked: false,
          likeCount,
          productId,
        },
      });
    } else {
      // Like: create new like
      const newLike = new ProductLike({ 
        productId: productObjectId, 
        userId: userObjectId 
      });
      await newLike.save();
      const likeCount = await ProductLike.countDocuments({ productId: productObjectId });

      res.json({
        success: true,
        message: "Product liked successfully",
        data: {
          isLiked: true,
          likeCount,
          productId,
        },
      });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ success: false, message: "Failed to toggle like", error: error.message });
  }
});

export default router;

