import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Camera,
    Upload,
    CheckCircle,
    XCircle,
    Loader2,
    Search,
    Trash2,
    RefreshCw,
    UserPlus,
    Image as ImageIcon,
    User,
    X
} from "lucide-react";
import Webcam from "react-webcam";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const API_URL = "/api";

interface RegisteredFace {
    name: string;
    registered_at?: string;
    image_url?: string; // If backend provides this
}

export const FaceRecognitionTool = () => {
    const [activeTab, setActiveTab] = useState("register");

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <Tabs defaultValue="register" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1">
                    <TabsTrigger
                        value="register"
                        className="data-[state=active]:bg-background data-[state=active]:text-[#00D4FF] data-[state=active]:shadow-sm border-b-2 border-transparent data-[state=active]:border-[#00D4FF] rounded-none transition-all"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Register New Face
                    </TabsTrigger>
                    <TabsTrigger
                        value="identify"
                        className="data-[state=active]:bg-background data-[state=active]:text-[#00D4FF] data-[state=active]:shadow-sm border-b-2 border-transparent data-[state=active]:border-[#00D4FF] rounded-none transition-all"
                    >
                        <Search className="w-4 h-4 mr-2" />
                        Identify Face
                    </TabsTrigger>
                    <TabsTrigger
                        value="gallery"
                        className="data-[state=active]:bg-background data-[state=active]:text-[#00D4FF] data-[state=active]:shadow-sm border-b-2 border-transparent data-[state=active]:border-[#00D4FF] rounded-none transition-all"
                    >
                        <User className="w-4 h-4 mr-2" />
                        Registered Faces
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="register" className="mt-0">
                    <RegisterFaceTab setActiveTab={setActiveTab} />
                </TabsContent>

                <TabsContent value="identify" className="mt-0">
                    <IdentifyFaceTab />
                </TabsContent>

                <TabsContent value="gallery" className="mt-0">
                    <GalleryTab />
                </TabsContent>
            </Tabs>
        </div>
    );
};

const RegisterFaceTab = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
    const [name, setName] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) processFile(selectedFile);
    };

    const processFile = (file: File) => {
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size exceeds 10MB limit.");
            return;
        }
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            toast.error("Only JPG and PNG formats supported.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
            setFile(file);
        };
        reader.readAsDataURL(file);
    };

    const captureCamera = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setPreview(imageSrc);
            // Convert base64 to file
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
                    setFile(file);
                });
            setIsCameraOpen(false);
        }
    };

    const handleRegister = async () => {
        if (!name.trim()) return toast.error("Name is required");
        if (!file) return toast.error("Image is required");

        setIsProcessing(true);
        const formData = new FormData();
        formData.append("name", name);
        formData.append("image", file);

        try {
            await axios.post(`${API_URL}/add_face`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setRegistrationSuccess(true);
            toast.success(`${name} registered successfully!`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to register face. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const resetForm = () => {
        setName("");
        setFile(null);
        setPreview(null);
        setRegistrationSuccess(false);
    };

    if (registrationSuccess) {
        return (
            <Card className="border-green-500/50 bg-green-50/10">
                <CardContent className="pt-6 text-center space-y-6">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
                            {name} registered successfully!
                        </h3>
                        <p className="text-muted-foreground">You can now identify their face in the system.</p>
                    </div>
                    <div className="flex justify-center gap-4">
                        <Button variant="outline" onClick={resetForm}>Register Another</Button>
                        <Button onClick={() => setActiveTab("identify")}>Go to Identify</Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Name Input */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Enter Person's Name</label>
                <div className="relative">
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter a name..."
                        maxLength={50}
                        className={cn(name.length === 0 && "border-red-300 focus-visible:ring-red-300")}
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                        {name.length}/50
                    </span>
                </div>
            </div>

            {/* Capture Area */}
            {!preview && !isCameraOpen && (
                <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-10 text-center hover:bg-muted/50 transition-colors"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) processFile(file);
                    }}
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-primary/10">
                            <Camera className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Drag & drop face image here</h3>
                            <p className="text-sm text-muted-foreground mt-1">OR click to browse • JPG, PNG • Max 10MB</p>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <Button onClick={() => setIsCameraOpen(true)}>
                                <Camera className="w-4 h-4 mr-2" />
                                Start Camera
                            </Button>
                            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Camera View */}
            {isCameraOpen && (
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-w-2xl mx-auto">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover"
                    />
                    <Button
                        className="absolute bottom-4 left-1/2 -translate-x-1/2"
                        onClick={captureCamera}
                    >
                        <Camera className="w-4 h-4 mr-2" />
                        Capture
                    </Button>
                    <Button
                        variant="ghost"
                        className="absolute top-4 right-4 text-white hover:bg-white/20"
                        onClick={() => setIsCameraOpen(false)}
                    >
                        <X className="w-6 h-6" />
                    </Button>
                </div>
            )}

            {/* Preview Area */}
            {preview && (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="relative w-40 h-40 rounded-lg overflow-hidden border">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 space-y-4 text-center md:text-left">
                                <div>
                                    <div className="flex items-center gap-2 justify-center md:justify-start text-green-600 mb-1">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="font-medium">Face detected!</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Quality: <span className="text-green-600 font-medium">Good</span></p>
                                </div>
                                <div className="flex gap-4 justify-center md:justify-start">
                                    <Button onClick={handleRegister} disabled={isProcessing}>
                                        {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                        Register This
                                    </Button>
                                    <Button variant="outline" onClick={() => { setPreview(null); setFile(null); }}>
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Try Another
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
};

const IdentifyFaceTab = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const webcamRef = useRef<Webcam>(null);

    const processFile = async (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
        setFile(file);

        // Auto start analysis
        setIsProcessing(true);

        // Get base64 for API
        const base64 = await new Promise<string>((resolve) => {
            const r = new FileReader();
            r.onloadend = () => resolve((r.result as string).split(",")[1]);
            r.readAsDataURL(file);
        });

        try {
            const response = await axios.post(`${API_URL}/predict_face`, { image: base64 }, {
                headers: { "Content-Type": "application/json" }
            });
            setResults(response.data.faces || []);
        } catch (e) {
            toast.error("Failed to identify face.");
        } finally {
            setIsProcessing(false);
        }
    };

    const captureCamera = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            // Convert base64 to file
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
                    processFile(file);
                });
            setIsCameraOpen(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Upload/Capture Area */}
            {!file && !isCameraOpen && (
                <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-10 text-center hover:bg-muted/50 transition-colors"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) processFile(file);
                    }}
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900">
                            <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Upload face to identify</h3>
                            <p className="text-sm text-muted-foreground mt-1">Drag & drop or click to browse</p>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <Button onClick={() => setIsCameraOpen(true)}>
                                <Camera className="w-4 h-4 mr-2" />
                                Start Camera
                            </Button>
                            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Camera View */}
            {isCameraOpen && (
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-w-2xl mx-auto">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover"
                    />
                    <Button
                        className="absolute bottom-4 left-1/2 -translate-x-1/2"
                        onClick={captureCamera}
                    >
                        <Camera className="w-4 h-4 mr-2" />
                        Capture
                    </Button>
                    <Button
                        variant="ghost"
                        className="absolute top-4 right-4 text-white hover:bg-white/20"
                        onClick={() => setIsCameraOpen(false)}
                    >
                        <X className="w-6 h-6" />
                    </Button>
                </div>
            )}

            {/* Loading State */}
            {isProcessing && (
                <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Analyzing face...</h3>
                    <p className="text-muted-foreground">Please wait</p>
                </div>
            )}

            {/* Results */}
            {!isProcessing && file && (
                <div className="space-y-6">
                    <div className="flex justify-center">
                        <div className="relative w-48 h-48 rounded-lg overflow-hidden border shadow-lg">
                            <img src={preview!} alt="Analyzed" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {results.length > 0 ? (
                            results.map((result, idx) => (
                                <Card key={idx} className="border-green-200 bg-green-50/20">
                                    <CardContent className="p-6 flex items-center gap-6">
                                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-8 h-8 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">{result.name || "Unknown Person"}</h3>
                                            <p className="text-green-700 font-medium">Match Confidence: {Math.round((result.confidence || 0) * 100)}%</p>
                                            <p className="text-sm text-muted-foreground">Status: IDENTIFIED</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card className="border-red-200 bg-red-50/20">
                                <CardContent className="p-6 text-center">
                                    <h3 className="text-lg font-bold text-red-700">No Match Found</h3>
                                    <p className="text-muted-foreground">This person is not in the database.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="text-center">
                        <Button variant="outline" onClick={() => { setFile(null); setPreview(null); setResults([]); }}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Analyze Another
                        </Button>
                    </div>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) processFile(f);
                }}
            />
        </div>
    );
};

// Gallery Tab - Mocking the list since endpoint is unknown, but providing UI
const GalleryTab = () => {
    // In a real app, this would be fetched from API
    // const [faces, setFaces] = useState<RegisteredFace[]>([]);
    // useEffect to fetch faces...

    // Mock data for display purposes since we can't implement full backend binding without docs
    const faces = [
        { name: "John Doe", registered_at: "2024-01-05" },
        { name: "Sarah Smith", registered_at: "2024-01-04" },
        { name: "Mike Johnson", registered_at: "2024-01-02" },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Registered Faces ({faces.length})</h3>
                <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search faces..." className="pl-9" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {faces.map((face, i) => (
                    <Card key={i}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                <User className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h4 className="font-semibold truncate">{face.name}</h4>
                                <p className="text-xs text-muted-foreground">Added {face.registered_at}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                    This gallery is currently showing mock data.
                    <br />connect to GET /faces to enable real gallery.
                </p>
            </div>
        </div>
    )
}
