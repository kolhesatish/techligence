import mongoose from "mongoose";

const toolSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    htmlContent: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    icon: {
      type: String,
      trim: true,
      default: "🔧",
    },
    image: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Indexes for efficient querying
toolSchema.index({ slug: 1 });
toolSchema.index({ status: 1 });
toolSchema.index({ category: 1 });
toolSchema.index({ createdAt: -1 });

export default mongoose.model("Tool", toolSchema);

