import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toolsAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

interface Tool {
  _id: string;
  title: string;
  slug: string;
  description: string;
  htmlContent: string;
  status: "draft" | "published";
  icon?: string;
  image?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

const ToolDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Fetch single tool using react-query
  const { data: tool, isLoading, isError, error } = useQuery<Tool, Error>({
    queryKey: ["tool", slug],
    queryFn: async () => {
      if (!slug) {
        throw new Error("Tool slug is missing.");
      }
      const response = await toolsAPI.getToolBySlug(slug);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch tool.");
      }
    },
    enabled: !!slug,
  });

  // Load HTML content into iframe when tool is loaded
  useEffect(() => {
    if (tool && iframeRef.current) {
      setIframeLoaded(false);
      const iframe = iframeRef.current;
      
      // Wait for iframe to load first
      const loadContent = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          
          if (iframeDoc) {
            // Ensure HTML content has proper structure
            let htmlContent = tool.htmlContent.trim();
            
            // If content doesn't start with <!DOCTYPE or <html, wrap it
            if (!htmlContent.match(/^\s*<!DOCTYPE/i) && !htmlContent.match(/^\s*<html/i)) {
              htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tool.title}</title>
</head>
<body>
${htmlContent}
</body>
</html>`;
            }
            
            // Write the HTML content directly to the iframe
            iframeDoc.open();
            iframeDoc.write(htmlContent);
            iframeDoc.close();
            
            // Execute any scripts that might not have executed
            setTimeout(() => {
              const scripts = iframeDoc.querySelectorAll('script');
              scripts.forEach((oldScript) => {
                const newScript = iframeDoc.createElement('script');
                Array.from(oldScript.attributes).forEach((attr) => {
                  newScript.setAttribute(attr.name, attr.value);
                });
                newScript.textContent = oldScript.textContent;
                oldScript.parentNode?.replaceChild(newScript, oldScript);
              });
              setIframeLoaded(true);
            }, 100);
          }
        } catch (error) {
          console.error("Error loading content into iframe:", error);
          setIframeLoaded(true); // Still mark as loaded to hide loader
        }
      };

      // If iframe is already loaded, write immediately
      if (iframe.contentDocument) {
        loadContent();
      } else {
        // Wait for iframe to load first
        iframe.onload = loadContent;
        // Also try after a short delay in case onload doesn't fire
        const timeoutId = setTimeout(() => {
          if (iframe.contentDocument) {
            loadContent();
          }
        }, 500);
        
        // Cleanup timeout on unmount
        return () => clearTimeout(timeoutId);
      }
    }
  }, [tool]);

  useEffect(() => {
    if (isError) {
      toast.error(error?.message || "Failed to load tool. It might not exist.");
      navigate("/tools");
    }
  }, [isError, error, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading tool...</p>
      </div>
    );
  }

  if (isError || !tool) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Tool not found.</p>
          <Button onClick={() => navigate("/tools")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tools
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <div className="container mx-auto px-4 py-6 border-b">
        <Button
          variant="outline"
          onClick={() => navigate("/tools")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tools
        </Button>
      </div>

      {/* Tool Info Header */}
      <div className="container mx-auto px-4 py-8 border-b">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-4">
          <div className="w-32 h-32 bg-gradient-to-br from-accent/20 to-primary/10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            {tool.image ? (
              <img
                src={tool.image}
                alt={tool.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-6xl">{tool.icon || "🔧"}</div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-display font-bold mb-2">
              {tool.title}
            </h1>
            <p className="text-lg text-muted-foreground">{tool.description}</p>
            {tool.category && (
              <div className="mt-3">
                <span className="text-sm text-muted-foreground">
                  Category: {tool.category}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HTML Content - Render in iframe for script execution */}
      <div className="w-full">
        <div className="relative bg-muted/30 rounded-lg border overflow-hidden">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/80" style={{ minHeight: "600px" }}>
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading tool...</p>
              </div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            title={tool.title}
            className="w-full border-0"
            style={{ 
              minHeight: "600px",
              width: "100%",
              border: "none",
              display: "block"
            }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
            allow="fullscreen"
          />
        </div>
      </div>
    </div>
  );
};

export default ToolDetail;

