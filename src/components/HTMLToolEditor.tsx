import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  FileText,
  Copy,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { toolsAPI } from "@/services/api";

interface HTMLToolEditorProps {
  value: string;
  onChange: (htmlContent: string) => void;
  disabled?: boolean;
}

const HTMLToolEditor = ({ value, onChange, disabled = false }: HTMLToolEditorProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.name.endsWith(".html") && file.type !== "text/html") {
      toast.error("Please upload a valid HTML file (.html extension)");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    try {
      const response = await toolsAPI.uploadHtmlFile(file);
      if (response.data.success) {
        onChange(response.data.data.htmlContent);
        toast.success(`HTML file uploaded successfully! (${response.data.data.fileName})`);
      } else {
        throw new Error(response.data.message || "Failed to upload file");
      }
    } catch (error: any) {
      console.error("Error uploading HTML file:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to upload HTML file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text);
        toast.success("HTML content pasted from clipboard!");
      } else {
        toast.error("Clipboard is empty");
      }
    } catch (error) {
      console.error("Error reading clipboard:", error);
      toast.error("Failed to read from clipboard. Please paste manually.");
    }
  };

  const copyToClipboard = () => {
    if (!value) {
      toast.error("No content to copy");
      return;
    }
    navigator.clipboard.writeText(value);
    toast.success("HTML content copied to clipboard!");
  };

  const clearContent = () => {
    onChange("");
    toast.info("Content cleared");
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="paste">
            <FileText className="w-4 h-4 mr-2" />
            Paste HTML
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload HTML File</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25"
                } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                onClick={() => !disabled && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,text/html"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={disabled}
                />
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Uploading HTML file...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Drag and drop an HTML file here, or click to select
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supported: .html files (max 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paste" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Paste HTML Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePasteFromClipboard}
                  disabled={disabled}
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Paste from Clipboard
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyToClipboard}
                  disabled={disabled || !value}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearContent}
                  disabled={disabled || !value}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="html-content">HTML Content</Label>
                <Textarea
                  id="html-content"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled}
                  placeholder="Paste your HTML code here or type it directly..."
                  className="font-mono text-sm min-h-[400px]"
                />
                <p className="text-xs text-muted-foreground">
                  {value.length} characters
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Section (Optional) */}
      {value && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg bg-muted/30" style={{ minHeight: "400px" }}>
              <iframe
                title="HTML Preview"
                className="w-full border-0"
                style={{ 
                  minHeight: "400px",
                  width: "100%",
                  border: "none"
                }}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                srcDoc={(() => {
                  // Ensure HTML content has proper structure
                  let htmlContent = value.trim();
                  
                  // If content doesn't start with <!DOCTYPE or <html, wrap it
                  if (!htmlContent.match(/^\s*<!DOCTYPE/i) && !htmlContent.match(/^\s*<html/i)) {
                    htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
</head>
<body>
${htmlContent}
</body>
</html>`;
                  }
                  return htmlContent;
                })()}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Preview with JavaScript enabled. The actual tool will render on a full page.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HTMLToolEditor;

