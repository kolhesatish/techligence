import { Eye, Brain, Users, Activity, Smile, Search } from "lucide-react";

export const TOOLS_CONFIG = {
  "face-recognition": {
    title: "Face Recognition",
    description: "AI-powered facial recognition and analysis",
    icon: Eye,
    status: "Available",
    features: [
      "Real-time face detection",
      "Multi-face recognition",
      "Facial landmark detection",
      "Age and gender estimation",
    ],
  },
  "depth-estimation": {
    title: "Depth Estimation",
    description: "3D depth perception and spatial analysis",
    icon: Brain,
    status: "Beta",
    features: [
      "Monocular depth estimation",
      "3D point cloud generation",
      "Distance measurement",
      "Obstacle detection",
    ],
  },
  "age-estimation": {
    title: "Age Estimation",
    description: "Automated age detection and classification",
    icon: Users,
    status: "Available",
    features: [
      "Age range prediction",
      "Demographic analysis",
      "Real-time processing",
      "Batch image analysis",
    ],
  },
  "activity-estimation": {
    title: "Activity Estimation",
    description: "Real-time activity and behavior recognition",
    icon: Activity,
    status: "Coming Soon",
    features: [
      "Human pose estimation",
      "Activity classification",
      "Movement tracking",
      "Behavior analysis",
    ],
  },
  emotion: {
    title: "Emotion Detection",
    description: "Emotional state analysis and recognition",
    icon: Smile,
    status: "Available",
    features: [
      "7 basic emotions",
      "Confidence scoring",
      "Real-time analysis",
      "Expression tracking",
    ],
  },
  "object-detection": {
    title: "Object Detection",
    description: "Advanced object identification and tracking",
    icon: Search,
    status: "Available",
    features: [
      "80+ object classes",
      "Bounding box detection",
      "Real-time processing",
      "Custom model support",
    ],
  },
};
