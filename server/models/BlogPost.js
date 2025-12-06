import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema(
  {
    postId: {
      type: Number,
      required: false, // Made optional for backward compatibility
      unique: true,
      sparse: true, // Allow multiple null values
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    authorRole: {
      type: String,
      required: true,
      trim: true,
    },
    publishedDate: {
      type: Date,
      required: true,
    },
    readTime: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["robotics", "ai", "technology", "tutorials", "industry", "innovation"], // Ensure categories match frontend
    },
    image: { // This will store the emoji or a URL
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: true, // Default to published, can be set to false for drafts
    },
    content: { // Full content of the blog post (HTML format)
      type: String,
      trim: true,
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Indexes for efficient querying
blogPostSchema.index({ postId: 1 });
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ featured: 1 });
blogPostSchema.index({ published: 1 });

export default mongoose.model("BlogPost", blogPostSchema);
