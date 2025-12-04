import mongoose from "mongoose";

const productLikeSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to ensure one like per user per product
productLikeSchema.index({ productId: 1, userId: 1 }, { unique: true });

export default mongoose.model("ProductLike", productLikeSchema);

