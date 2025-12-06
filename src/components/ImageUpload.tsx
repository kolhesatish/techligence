import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";
import { productsAPI, blogAPI } from "@/services/api";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  label?: string;
  type?: 'product' | 'blog'; // Type of upload (defaults to 'product')
}

export const ImageUpload = ({ value, onChange, disabled = false, label, type = 'product' }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);

      // Simulate progress (since we can't track actual upload progress easily)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Use appropriate API based on type
      const response = type === 'blog' 
        ? await blogAPI.uploadBlogImage(formData)
        : await productsAPI.uploadProductImage(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.data.success && response.data.data?.url) {
        onChange(response.data.data.url);
        toast.success("Image uploaded successfully!");
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to upload image");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Create a synthetic event to reuse handleFileSelect logic
      const syntheticEvent = {
        target: {
          files: [file]
        }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(syntheticEvent);
    } else {
      toast.error("Please drop an image file");
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label || (type === 'blog' ? 'Blog Image' : 'Product Image')}</Label>
      <div className="space-y-4">
        {/* File Input */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            disabled || uploading
              ? "bg-muted cursor-not-allowed"
              : "bg-background hover:border-primary cursor-pointer"
          }`}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
          />
          {uploading ? (
            <div className="space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : value ? (
            <div className="space-y-2">
              <img
                src={value}
                alt={type === 'blog' ? 'Blog preview' : 'Product preview'}
                className="max-h-48 mx-auto rounded-lg object-contain"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                disabled={disabled}
              >
                <X className="h-4 w-4 mr-2" />
                Remove Image
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          )}
        </div>

        {/* Current Image URL Display (if exists) */}
        {value && !uploading && (
          <div className="text-xs text-muted-foreground break-all">
            Image URL: {value}
          </div>
        )}
      </div>
    </div>
  );
};

