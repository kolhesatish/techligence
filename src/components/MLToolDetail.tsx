import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Upload,
  Pause,
  Trash,
  Send,
  Eye,
  Brain,
  Users,
  Activity,
  Smile,
  Search,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";
import { TOOLS_CONFIG } from "@/lib/constants.ts"; // Import the config
import axios from "axios"; // Using axios for API calls
import { FaceRecognitionTool } from "@/components/tools/FaceRecognitionTool";

// Backend API URL - CHANGE THIS IF YOUR FLASK APP IS ON A DIFFERENT HOST/PORT
// Backend API URL - using proxy
const API_URL = "/api";

interface ResultData {
  bbox?: number[];
  label?: string;
  confidence?: number;
  emotion?: string;
  age?: number;
  name?: string;
}

const MLToolDetail = ({ tool }: { tool: string }) => {
  const currentTool = TOOLS_CONFIG[tool as keyof typeof TOOLS_CONFIG];

  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<ResultData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [faceName, setFaceName] = useState("");
  const [addFaceImage, setAddFaceImage] = useState<File | null>(null);

  if (!currentTool) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Tool not found.</h2>
        <Link to="/ml-tools" className="text-primary mt-4 inline-block">
          <Button variant="link">Back to all tools</Button>
        </Link>
      </div>
    );
  }

  const handleStartCamera = () => {
    setIsCameraActive(true);
    setImageSrc(null); // Clear any uploaded image
    setFile(null);
    setResults([]);
  };

  const handleStopCamera = () => {
    setIsCameraActive(false);
    setResults([]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setIsCameraActive(false); // Stop camera if file is uploaded
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        setFile(uploadedFile);
        setResults([]);
      };
      reader.readAsDataURL(uploadedFile);
    }
  };

  const handleProcessImage = async () => {
    if (!file) {
      toast.error("Please upload an image first.");
      return;
    }
    setIsLoading(true);
    const base64Image = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove the data URI part
        resolve((reader.result as string).split(",")[1]);
      };
      reader.readAsDataURL(file);
    });

    try {
      let endpoint = "";
      switch (tool) {
        case "emotion":
          endpoint = `${API_URL}/predict_emotion`;
          break;
        case "age-estimation":
          endpoint = `${API_URL}/predict_age`;
          break;
        case "face-recognition":
          endpoint = `${API_URL}/predict_face`;
          break;
        case "object-detection":
        case "depth-estimation":
        case "activity-estimation":
          endpoint = `${API_URL}/process_frame`;
          break;
        default:
          toast.error("Unsupported tool for static image processing.");
          setIsLoading(false);
          return;
      }

      const payload: any = { image: base64Image };
      if (tool !== "emotion" && tool !== "age-estimation" && tool !== "face-recognition") {
        // These tools use a generic endpoint with a 'type' parameter
        payload.type = tool.replace("-", "_");
      }

      const response = await axios.post(endpoint, payload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("API Response:", response.data);

      let newResults: ResultData[] = [];
      if (tool === "emotion") {
        newResults = response.data.emotions || [];
      } else if (tool === "age-estimation") {
        newResults = response.data.age_predictions || [];
      } else if (tool === "face-recognition") {
        newResults = response.data.faces || [];
      } else if (tool === "object-detection") {
        newResults = response.data.detections || [];
      }

      setResults(newResults);
      toast.success("Image processed successfully!");
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Failed to process image. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  // Main processing loop for webcam
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isCameraActive) {
      interval = setInterval(async () => {
        if (!webcamRef.current) return;
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          const base64Image = imageSrc.split(",")[1];
          const payload = {
            image: base64Image,
            type: tool.replace("-", "_"),
          };

          let endpoint = "";
          switch (tool) {
            case "emotion":
              endpoint = `${API_URL}/predict_emotion`;
              break;
            case "age-estimation":
              endpoint = `${API_URL}/predict_age`;
              break;
            case "face-recognition":
              endpoint = `${API_URL}/predict_face`;
              break;
            default:
              // Use the generic endpoint for other tools
              endpoint = `${API_URL}/process_frame`;
              break;
          }

          try {
            const response = await axios.post(endpoint, payload, {
              headers: { "Content-Type": "application/json" },
            });

            // Map the response to the frontend's expected format
            let newResults: ResultData[] = [];
            if (tool === "emotion") {
              newResults = response.data.emotions || [];
            } else if (tool === "age-estimation") {
              newResults = response.data.age_predictions || [];
            } else if (tool === "face-recognition") {
              newResults = response.data.faces || [];
            } else if (tool === "object-detection") {
              newResults = response.data.detections || [];
            }

            setResults(newResults);

            // Draw results on the canvas
            if (canvasRef.current) {
              const context = canvasRef.current.getContext("2d");
              if (context) {
                const img = new Image();
                img.onload = () => {
                  canvasRef.current!.width = img.width;
                  canvasRef.current!.height = img.height;
                  context.drawImage(img, 0, 0);

                  newResults.forEach((result) => {
                    if (result.bbox) {
                      const [left, top, right, bottom] = result.bbox;
                      context.strokeStyle = "red";
                      context.lineWidth = 2;
                      context.strokeRect(left, top, right - left, bottom - top);

                      const labelText =
                        result.emotion || result.age || result.name || result.label;
                      if (labelText) {
                        context.fillStyle = "red";
                        context.font = "16px Arial";
                        context.fillText(String(labelText), left, top > 10 ? top - 5 : top + 15);
                      }
                    }
                  });
                };
                img.src = imageSrc;
              }
            }
          } catch (error) {
            console.error("API Error:", error);
            // Handle error, maybe show a toast
            setIsCameraActive(false);
            clearInterval(interval!);
          }
        }
      }, 500); // Process frame every 500ms
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isCameraActive, tool]);

  const handleAddFaceSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!faceName || !addFaceImage) {
      toast.error("Please provide a name and an image.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("name", faceName);
    formData.append("image", addFaceImage);

    try {
      const response = await axios.post(`${API_URL}/add_face`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(response.data.message || "Face added successfully!");
      setFaceName("");
      setAddFaceImage(null);
    } catch (error) {
      console.error("Add face error:", error);
      toast.error("Failed to add face. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic status badge
  const StatusBadge = () => {
    let variant: "default" | "secondary" | "outline" | "destructive" = "default";
    if (currentTool.status === "Beta") variant = "secondary";
    else if (currentTool.status === "Coming Soon") variant = "outline";
    return <Badge variant={variant}>{currentTool.status}</Badge>;
  };

  const isStaticTool = ["face-recognition", "emotion", "age-estimation"].includes(tool);
  const hasVideoOutput = !imageSrc;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <Link
          to="/ml-tools"
          className="inline-flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to ML Tools
        </Link>

        {/* Tool Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <currentTool.icon className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {currentTool.title}
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-4">
            {currentTool.description}
          </p>
          <StatusBadge />
        </div>

        {tool === "face-recognition" ? (
          <FaceRecognitionTool />
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Tool Interface */}
            <Card>
              <CardHeader>
                <CardTitle>Tool Interface</CardTitle>
                <CardDescription>
                  Upload or capture media to analyze with {currentTool.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Media Display Area */}
                <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-2 text-center overflow-hidden">
                  {!isCameraActive && !imageSrc && (
                    <div className="py-12">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Upload an image or start camera capture
                      </p>
                    </div>
                  )}
                  {isCameraActive && (
                    <div className="relative">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="rounded-lg w-full"
                      />
                      {/* Bounding box overlay for camera feed */}
                      <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full"
                      />
                    </div>
                  )}
                  {imageSrc && (
                    <div className="relative">
                      <img src={imageSrc} alt="Uploaded" className="rounded-lg w-full" />
                      {/* Bounding box overlay for uploaded image */}
                      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        {results.map((result, index) => {
                          if (result.bbox) {
                            const [left, top, right, bottom] = result.bbox;
                            const width = right - left;
                            const height = bottom - top;
                            const labelText = result.emotion || result.age || result.name || result.label;
                            return (
                              <g key={index}>
                                <rect
                                  x={left}
                                  y={top}
                                  width={width}
                                  height={height}
                                  fill="none"
                                  stroke="red"
                                  strokeWidth="2"
                                />
                                <text
                                  x={left}
                                  y={top > 10 ? top - 5 : top + 15}
                                  fill="red"
                                  fontSize="14"
                                  fontWeight="bold"
                                  stroke="black"
                                  strokeWidth="0.5"
                                >
                                  {labelText}
                                </text>
                              </g>
                            );
                          }
                          return null;
                        })}
                      </svg>
                    </div>
                  )}
                </div>

                {/* Controls */}
                {currentTool.status !== "Coming Soon" ? (
                  <>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={handleStartCamera} disabled={isCameraActive}>
                        <Play className="h-4 w-4 mr-2" />
                        Start Camera
                      </Button>
                      <Button
                        onClick={handleStopCamera}
                        variant="destructive"
                        disabled={!isCameraActive}
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Stop Camera
                      </Button>
                    </div>

                    <div className="flex gap-2 justify-center">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Button variant="outline" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Image
                          </span>
                        </Button>
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      {imageSrc && (
                        <>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setImageSrc(null);
                              setFile(null);
                              setResults([]);
                            }}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Clear Image
                          </Button>
                          <Button onClick={handleProcessImage} disabled={isLoading}>
                            <Send className="h-4 w-4 mr-2" />
                            {isLoading ? "Processing..." : "Process Image"}
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p>This tool is currently under development.</p>
                    <p>Check back soon for updates!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features and Add Face Form */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                  <CardDescription>
                    Key capabilities of {currentTool.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {currentTool.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-primary rounded-full" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Add Face Form (Conditional) - Kept for fallback but won't be reached for face-recognition */}
              {tool === "face-recognition" && !isStaticTool && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add a New Face</CardTitle>
                    <CardDescription>
                      Register a new person for recognition.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddFaceSubmit} className="space-y-4">
                      <Input
                        placeholder="Enter a name"
                        value={faceName}
                        onChange={(e) => setFaceName(e.target.value)}
                      />
                      <label htmlFor="add-face-upload" className="cursor-pointer">
                        <Button variant="outline" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            {addFaceImage ? addFaceImage.name : "Select Image"}
                          </span>
                        </Button>
                      </label>
                      <input
                        id="add-face-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAddFaceImage(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <Button type="submit" disabled={isLoading} className="w-full">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        {isLoading ? "Adding..." : "Add Face"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MLToolDetail;
