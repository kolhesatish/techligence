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
import { Loader2, ArrowLeft, Save, Eye } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toolsAPI } from "@/services/api";
import HTMLToolEditor from "@/components/HTMLToolEditor";
import { ImageUpload } from "@/components/ImageUpload";

interface ToolFormData {
  title: string;
  slug: string;
  description: string;
  htmlContent: string;
  status: "draft" | "published";
  icon: string;
  image: string;
  category: string;
}

const AdminToolForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const { isAuthenticated, user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState<ToolFormData>({
    title: "",
    slug: "",
    description: "",
    htmlContent: "",
    status: "draft",
    icon: "🔧",
    image: "",
    category: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingTool, setIsLoadingTool] = useState(isEditMode);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Check authentication and role
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== "admin") {
        toast.error("Admin access only.");
        navigate("/admin/dashboard");
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  // Fetch tool data if in edit mode
  useEffect(() => {
    const fetchTool = async () => {
      if (isEditMode && id) {
        setIsLoadingTool(true);
        try {
          const response = await toolsAPI.getAllTools();
          if (response.data.success && response.data.data) {
            const tool = response.data.data.find(
              (t: any) => t._id === id || t.slug === id
            );
            if (tool) {
              setFormData({
                title: tool.title || "",
                slug: tool.slug || "",
                description: tool.description || "",
                htmlContent: tool.htmlContent || "",
                status: tool.status || "draft",
                icon: tool.icon || "🔧",
                image: tool.image || "",
                category: tool.category || "",
              });
            } else {
              throw new Error("Tool not found");
            }
          }
        } catch (error: any) {
          console.error("Failed to fetch tool:", error);
          toast.error("Failed to load tool data");
          navigate("/admin/dashboard");
        } finally {
          setIsLoadingTool(false);
        }
      }
    };

    fetchTool();
  }, [isEditMode, id, navigate]);

  // Auto-generate slug when title changes (if not manually edited)
  useEffect(() => {
    if (!slugManuallyEdited && formData.title && !isEditMode) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(formData.title),
      }));
    }
  }, [formData.title, slugManuallyEdited, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "slug") {
      setSlugManuallyEdited(true);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHtmlContentChange = (htmlContent: string) => {
    setFormData((prev) => ({ ...prev, htmlContent }));
  };

  const handleSubmit = async (e: React.FormEvent, publishStatus: "draft" | "published") => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError("Title is required");
      toast.error("Please enter a title");
      return;
    }

    if (!formData.description.trim()) {
      setError("Description is required");
      toast.error("Please enter a description");
      return;
    }

    if (!formData.htmlContent.trim()) {
      setError("HTML content is required");
      toast.error("Please add HTML content");
      return;
    }

    if (!formData.slug.trim()) {
      setError("Slug is required");
      toast.error("Please enter a slug");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        status: publishStatus,
      };

      if (isEditMode && id) {
        const response = await toolsAPI.updateTool(id, submitData);
        if (response.data.success) {
          toast.success(
            `Tool ${publishStatus === "published" ? "published" : "saved as draft"} successfully!`
          );
          navigate("/admin/dashboard?tab=tools");
        } else {
          throw new Error(response.data.message || "Failed to update tool");
        }
      } else {
        const response = await toolsAPI.createTool(submitData);
        if (response.data.success) {
          toast.success(
            `Tool ${publishStatus === "published" ? "published" : "saved as draft"} successfully!`
          );
          navigate("/admin/dashboard?tab=tools");
        } else {
          throw new Error(response.data.message || "Failed to create tool");
        }
      }
    } catch (error: any) {
      console.error("Failed to save tool:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to save tool";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoadingTool) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/admin/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditMode ? "Edit Tool" : "Create New Tool"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEditMode
            ? "Update tool information and HTML content"
            : "Add a new HTML tool to your collection"}
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g., HTML Color Picker"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  name="slug"
                  type="text"
                  placeholder="e.g., html-color-picker"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly identifier (auto-generated from title)
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief description of what this tool does..."
                value={formData.description}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (Emoji)</Label>
                <Input
                  id="icon"
                  name="icon"
                  type="text"
                  placeholder="🔧"
                  value={formData.icon}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  maxLength={2}
                />
                <p className="text-xs text-muted-foreground">
                  Single emoji character (fallback if no image)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  type="text"
                  placeholder="e.g., Utilities"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    handleSelectChange("status", value)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                disabled={isSubmitting}
                type="tool"
                label="Tool Image (Recommended)"
              />
              <p className="text-xs text-muted-foreground">
                Upload an image for the tool. This will be displayed in the tools listing page. If no image is uploaded, the emoji icon will be used as fallback.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* HTML Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              HTML Content <span className="text-red-500">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HTMLToolEditor
              value={formData.htmlContent}
              onChange={handleHtmlContentChange}
              disabled={isSubmitting}
            />
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            <p>{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/dashboard")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={(e) => handleSubmit(e, "draft")}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save as Draft
          </Button>
          <Button
            type="button"
            onClick={(e) => handleSubmit(e, "published")}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            Publish Tool
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminToolForm;

