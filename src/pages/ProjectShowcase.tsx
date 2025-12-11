import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Play, FileText, MessageSquare, Video, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";
import { analytics } from "@/services/analytics";
import { useEffect, useState } from "react";

type Project = {
  title: string;
  summary: string;
  problem: string;
  result: string;
  technologies: string[];
  media: {
    src: string;
    alt: string;
    type: "image" | "video";
  };
  ctas: {
    demo?: string;
    report?: string;
    contact?: string;
  };
};

const projects: Project[] = [
  {
    title: "Autonomous Warehouse Rover",
    summary:
      "4WD rover with SLAM, obstacle avoidance, and pallet detection for brownfield warehouses.",
    problem: "Manual pallet moves were slow and error-prone during peak hours.",
    result:
      "Reduced aisle traversal time by 32% and achieved 98.5% successful drop-offs in pilot.",
    technologies: ["ROS2", "Nav2", "LiDAR", "OpenCV", "TensorRT"],
    media: {
      // TODO: Replace with your actual project demo video
      // Place your video file in the public folder and update the path here
      // Example: "/videos/warehouse-rover-demo.mp4"
      src: "/techligence_robot.mp4", // Current placeholder video - replace with your project video
      alt: "Warehouse rover demo video",
      type: "video",
    },
    ctas: {
      demo: "/controller",
      report:
        "https://drive.google.com/uc?export=download&id=1Zt-demo-warehouse-report",
      contact: "/contact",
    },
  },
  {
    title: "Outdoor Exploration UGV",
    summary:
      "IP65 rugged UGV for terrain mapping with stereo depth and RTK-GPS fusion.",
    problem: "Needed high-fidelity terrain maps without drone access in RF-limited zones.",
    result:
      "Captured 12 km of track with <12 cm RMSE elevation error; ran 3 hours per pack.",
    technologies: ["ROS", "URDF", "RTK-GPS", "Stereo Vision", "Open3D"],
    media: {
      src: "https://placehold.co/800x450/0f172a/ffffff?text=Exploration+UGV",
      alt: "UGV terrain mapping",
      type: "image",
    },
    ctas: {
      demo: "/ml-tools/depth-estimation",
      report:
        "https://drive.google.com/uc?export=download&id=1Zt-demo-ugv-report",
      contact: "/contact",
    },
  },
  {
    title: "Vision-Guided Pick & Place",
    summary:
      "Robotic arm cell with RGB-D picking, conveyor tracking, and quality inspection.",
    problem: "High defect rate on mixed-SKU kitting lines with minimal fixturing.",
    result:
      "Raised first-pass yield to 97.2% and cut cycle time to 4.8s per pick on mixed parts.",
    technologies: ["OpenCV", "MediaPipe", "YOLOv8", "MoveIt", "TensorFlow Lite"],
    media: {
      src: "https://placehold.co/800x450/111827/ffffff?text=Pick+%26+Place",
      alt: "Pick and place demo",
      type: "image",
    },
    ctas: {
      demo: "/controller/advanced-urdf-controller",
      report:
        "https://drive.google.com/uc?export=download&id=1Zt-demo-pickplace-report",
      contact: "/contact",
    },
  },
  {
    title: "Assistive Telepresence Bot",
    summary:
      "Remote telepresence robot with emotion detection and low-latency video pipeline.",
    problem: "Clinics needed remote rounds with patient affect monitoring.",
    result:
      "Delivered sub-120ms E2E latency on LAN and 88% emotion detection accuracy in trials.",
    technologies: ["WebRTC", "EmotionNet", "Edge TPU", "React", "Supabase"],
    media: {
      src: "https://placehold.co/800x450/0ea5e9/ffffff?text=Telepresence+Bot",
      alt: "Telepresence robot demo",
      type: "image",
    },
    ctas: {
      demo: "/ml-tools/emotion",
      report:
        "https://drive.google.com/uc?export=download&id=1Zt-demo-telepresence-report",
      contact: "/contact",
    },
  },
  {
    title: "Autonomous Delivery Robot",
    summary:
      "Last-mile delivery robot with dynamic obstacle avoidance and secure package handling.",
    problem: "Urban delivery costs were high and delivery windows were inflexible.",
    result:
      "Achieved 95% on-time delivery rate and reduced per-delivery cost by 40% in pilot zones.",
    technologies: ["ROS2", "LiDAR SLAM", "Computer Vision", "IoT", "Cloud Analytics"],
    media: {
      src: "https://placehold.co/800x450/10b981/ffffff?text=Delivery+Robot",
      alt: "Autonomous delivery robot",
      type: "image",
    },
    ctas: {
      demo: "/controller",
      report:
        "https://drive.google.com/uc?export=download&id=1Zt-demo-delivery-report",
      contact: "/contact",
    },
  },
];

const ProjectShowcase = () => {
  const { trackCTAClick } = useAnalytics();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    // Track page view is handled by useAnalytics hook
  }, []);

  const handleVideoClick = (videoSrc: string) => {
    setSelectedVideo(videoSrc);
    setIsVideoModalOpen(true);
    analytics.trackCTAClick('project_video_play');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl lg:text-5xl font-semibold mb-4 text-foreground">
            Project Showcase
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Real-world robotics projects with measurable results and proven impact.
          </p>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="space-y-24">
            {projects.map((project, index) => (
              <div key={project.title} className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Media Section */}
                <div className="relative">
                  {project.media.type === "video" ? (
                    <div 
                      className="relative aspect-video bg-muted cursor-pointer group"
                      onClick={() => handleVideoClick(project.media.src)}
                    >
                      <video
                        src={project.media.src}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => e.currentTarget.pause()}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                          <Play className="w-6 h-6 text-foreground ml-1" fill="currentColor" />
                        </div>
                      </div>
                      <Badge className="absolute top-4 left-4">
                        <Video className="w-3 h-3 mr-1" />
                        Video
                      </Badge>
                    </div>
                  ) : (
                    <div className="relative aspect-video bg-muted">
                      <img
                        src={project.media.src}
                        alt={project.media.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                
                {/* Content Section */}
                <div className="flex flex-col justify-center space-y-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Project {String(index + 1).padStart(2, '0')}
                    </div>
                    <h2 className="text-3xl font-semibold mb-4 text-foreground">
                      {project.title}
                    </h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {project.summary}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Problem</h3>
                      <p className="text-sm text-foreground">{project.problem}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Result</h3>
                      <p className="text-sm text-foreground">{project.result}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    {project.ctas.demo && (
                      <Link to={project.ctas.demo}>
                        <Button 
                          variant="default"
                          className="gap-2"
                          onClick={() => {
                            trackCTAClick(`project_demo_${project.title}`);
                            analytics.trackDemoStart();
                          }}
                        >
                          <Play className="w-4 h-4" />
                          View Demo
                        </Button>
                      </Link>
                    )}
                    {project.ctas.report && (
                      <a href={project.ctas.report} target="_blank" rel="noreferrer">
                        <Button 
                          variant="outline"
                          className="gap-2"
                          onClick={() => trackCTAClick(`project_report_${project.title}`)}
                        >
                          <FileText className="w-4 h-4" />
                          Download Report
                        </Button>
                      </a>
                    )}
                    {project.ctas.contact && (
                      <Link to={project.ctas.contact}>
                        <Button 
                          variant="ghost"
                          className="gap-2"
                          onClick={() => trackCTAClick(`project_contact_${project.title}`)}
                        >
                          <MessageSquare className="w-4 h-4" />
                          Contact
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl font-semibold mb-3 text-foreground">
            Interested in a custom solution?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Schedule a demo or discuss how we can adapt these proven solutions to your specific needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button variant="default" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Contact Us
              </Button>
            </Link>
            <Link to="/controller">
              <Button variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-5xl w-full p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Project Demo Video</DialogTitle>
            <DialogDescription>
              Watch the full demonstration of this robotics project
            </DialogDescription>
          </DialogHeader>
          {selectedVideo && (
            <div className="relative w-full aspect-video bg-black">
              <video
                src={selectedVideo}
                className="w-full h-full object-contain"
                controls
                autoPlay
                playsInline
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectShowcase;

