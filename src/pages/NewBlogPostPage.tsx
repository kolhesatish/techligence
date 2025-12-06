import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, PlusCircle, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // Corrected import path for AuthContext
import { blogAPI } from "@/services/api"; // Import blogAPI
import RichTextEditor from "@/components/RichTextEditor";
import { ImageUpload } from "@/components/ImageUpload"; // Import ImageUpload component

// Helper function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Define the type for blog post data
interface BlogPostFormData {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  publishedDate: string; // Stored as string for input, will convert to Date
  readTime: string;
  category: string;
  image: string; // Emoji or URL
  likes: number;
  comments: number;
  featured: boolean;
  published: boolean;
  content: string; // Full content of the blog post (HTML format)
}

const NewBlogPostPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>(); // Get slug from URL for edit mode
  const isEditMode = !!slug;

  const { isAuthenticated, user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState<BlogPostFormData>({
    slug: "",
    title: "",
    excerpt: "",
    author: "",
    authorRole: "",
    publishedDate: new Date().toISOString().split('T')[0], // Default to today's date
    readTime: "",
    category: "",
    image: "",
    likes: 0,
    comments: 0,
    featured: false,
    published: true, // Default to published
    content: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(isEditMode); // Loading state for fetching post in edit mode

  const categories = [
    { id: "robotics", name: "Robotics" },
    { id: "ai", name: "Artificial Intelligence" },
    { id: "technology", name: "Technology" },
    { id: "tutorials", name: "Tutorials" },
    { id: "industry", name: "Industry News" },
    { id: "innovation", name: "Innovation" },
  ];

  // Effect to check authentication and role on component mount
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== "admin") {
        toast.error("Admin access only.");
        navigate("/");
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  // Effect to fetch blog post data if in edit mode
  useEffect(() => {
    const fetchBlogPost = async () => {
      if (isEditMode && slug) {
        setIsLoadingPost(true);
        try {
          // Try fetching by slug first, fallback to postId if slug looks like a number (old posts)
          let response;
          const slugAsNumber = parseInt(slug);
          const isNumericSlug = !isNaN(slugAsNumber) && String(slugAsNumber) === slug;
          
          if (isNumericSlug) {
            // Slug is actually a number (old postId), use backward compatibility route
            response = await blogAPI.getBlogPostById(slugAsNumber);
          } else {
            // Try slug route
            response = await blogAPI.getBlogPostBySlug(slug);
          }

          if (response.data.success && response.data.data) {
            const postData = response.data.data;
            setFormData({
              slug: postData.slug || generateSlug(postData.title),
              title: postData.title,
              excerpt: postData.excerpt,
              author: postData.author,
              authorRole: postData.authorRole,
              publishedDate: new Date(postData.publishedDate).toISOString().split('T')[0], // Format date for input
              readTime: postData.readTime,
              category: postData.category,
              image: postData.image,
              likes: postData.likes,
              comments: postData.comments,
              featured: postData.featured,
              published: postData.published !== undefined ? postData.published : true,
              content: postData.content || "",
            });
          } else {
            throw new Error(response.data.message || "Failed to fetch blog post.");
          }
        } catch (err: any) {
          console.error("Error fetching blog post:", err);
          setError(err.response?.data?.message || err.message || "Failed to load blog post for editing.");
          toast.error(err.response?.data?.message || err.message || "Failed to load blog post.");
          navigate("/blog"); // Redirect if post not found or error
        } finally {
          setIsLoadingPost(false);
        }
      }
    };

    fetchBlogPost();
  }, [isEditMode, slug, navigate]);

  // Auto-generate slug from title only once when title is first entered and slug is empty
  useEffect(() => {
    if (!isEditMode && formData.title && !formData.slug) {
      const newSlug = generateSlug(formData.title);
      setFormData((prev) => ({ ...prev, slug: newSlug }));
    }
  }, [formData.title, isEditMode]); // Only generate when title changes and slug is empty

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // Correctly handle checkbox 'checked' property
    const inputValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: inputValue,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!formData.title || !formData.excerpt || !formData.author || !formData.category || !formData.readTime || !formData.image || !formData.content || !formData.slug) {
        throw new Error("Please fill in all required fields.");
      }
      if (formData.likes < 0 || formData.comments < 0) {
        throw new Error("Likes and comments cannot be negative.");
      }

      // Ensure slug is generated if empty
      const finalSlug = formData.slug || generateSlug(formData.title);

      const dataToSend = {
        ...formData,
        slug: finalSlug,
        publishedDate: new Date(formData.publishedDate), // Convert to Date object for backend
      };

      let response;
      if (isEditMode && slug) {
        // Check if slug is numeric (old postId), use backward compatibility route
        const slugAsNumber = parseInt(slug);
        const isNumericSlug = !isNaN(slugAsNumber) && String(slugAsNumber) === slug;
        
        if (isNumericSlug) {
          // Use postId route for old posts
          response = await blogAPI.updateBlogPost(slugAsNumber, dataToSend);
        } else {
          // Use slug route for new posts
          response = await blogAPI.updateBlogPostBySlug(slug, dataToSend);
        }
      } else {
        response = await blogAPI.addBlogPost(dataToSend);
      }

      // Check response structure - axios wraps response in .data
      // apiCall returns the axios response directly, so response.data contains the server response
      const responseData = response?.data;
      const status = response?.status;
      
      // Check for success - server returns { success: true, message: "...", data: ... }
      const isSuccess = responseData?.success === true;
      
      if (isSuccess) {
        // Show success message
        toast.success(isEditMode ? "Blog post updated successfully!" : "Blog added successfully!");
        
        // Reset form after successful submission
        setFormData({
          slug: "",
          title: "",
          excerpt: "",
          author: "",
          authorRole: "",
          publishedDate: new Date().toISOString().split('T')[0],
          readTime: "",
          category: "",
          image: "",
          likes: 0,
          comments: 0,
          featured: false,
          published: true,
          content: "",
        });
        
        // Small delay before navigation to ensure toast is visible
        setTimeout(() => {
          navigate("/blog"); // Redirect to blog list page
        }, 500);
        return; // Exit early on success - don't execute catch block
      } else {
        // Response exists but success is false or missing
        const errorMessage = responseData?.message || `Failed to ${isEditMode ? "update" : "add"} blog post.`;
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error(`Failed to ${isEditMode ? "update" : "add"} blog post:`, err);
      
      // Extract error message from various possible locations
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.error || 
        err.message || 
        `Failed to ${isEditMode ? "update" : "add"} blog post. Please try again.`;
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || (isEditMode && isLoadingPost)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">
          {authLoading ? "Loading authentication status..." : "Loading blog post data..."}
        </p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null; // Redirection handled by useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            {isEditMode ? "Edit Blog Post" : "Create New Blog Post"}
          </CardTitle>
          <p className="text-center text-muted-foreground">
            {isEditMode ? "Modify the details of this blog post." : "Fill in the details to create a new blog post."}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline ml-2">{error}</span>
              </div>
            )}

            {/* Basic Information */}
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Post Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-full">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g., The Future of AI"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  type="text"
                  placeholder="e.g., the-future-of-ai"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-muted-foreground">URL-friendly identifier</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={handleSelectChange} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-full">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  placeholder="A short summary of the blog post..."
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author Name</Label>
                <Input
                  id="author"
                  name="author"
                  type="text"
                  placeholder="e.g., Jane Doe"
                  value={formData.author}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorRole">Author Role</Label>
                <Input
                  id="authorRole"
                  name="authorRole"
                  type="text"
                  placeholder="e.g., Lead AI Engineer"
                  value={formData.authorRole}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publishedDate">Published Date</Label>
                <Input
                  id="publishedDate"
                  name="publishedDate"
                  type="date"
                  value={formData.publishedDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="readTime">Read Time</Label>
                <Input
                  id="readTime"
                  name="readTime"
                  type="text"
                  placeholder="e.g., 10 min read"
                  value={formData.readTime}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2 col-span-full">
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                  disabled={isSubmitting}
                  type="blog"
                  label="Blog Image / Emoji"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="likes">Likes</Label>
                <Input
                  id="likes"
                  name="likes"
                  type="number"
                  min="0"
                  placeholder="e.g., 150"
                  value={formData.likes}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comments">Comments</Label>
                <Input
                  id="comments"
                  name="comments"
                  type="number"
                  min="0"
                  placeholder="e.g., 25"
                  value={formData.comments}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-center space-x-2 col-span-full">
                <Input
                  id="featured"
                  name="featured"
                  type="checkbox"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <Label htmlFor="featured">Mark as Featured</Label>
              </div>
              <div className="flex items-center space-x-2 col-span-full">
                <Input
                  id="published"
                  name="published"
                  type="checkbox"
                  checked={formData.published}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <Label htmlFor="published">Published (uncheck to save as draft)</Label>
              </div>
            </div>

            {/* Full Content */}
            <h3 className="text-xl font-semibold mb-4 border-b pb-2 mt-8">Full Content</h3>
            <div className="space-y-2">
              <Label htmlFor="content">Blog Post Content</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
                placeholder="Start writing your blog post..."
              />
            </div>

            <Button type="submit" className="w-full gap-2 mt-8" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isEditMode ? (
                <Save className="w-5 h-5" />
              ) : (
                <PlusCircle className="w-5 h-5" />
              )}
              {isSubmitting ? (isEditMode ? "Updating Post..." : "Creating Post...") : (isEditMode ? "Update Post" : "Create Post")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewBlogPostPage;
