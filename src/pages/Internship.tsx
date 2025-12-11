import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, GraduationCap, Timer, FileText, MapPin, Sparkles, Award, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

const weeks = [
  {
    title: "Week 1: Foundations",
    items: [
      "Linux, Git, ROS/ROS2 basics",
      "URDF + kinematics primer",
      "Python tooling, notebooks",
    ],
  },
  {
    title: "Week 2: Perception",
    items: [
      "Camera calibration & transforms",
      "OpenCV pipelines (tracking, filtering)",
      "Intro to MediaPipe / YOLO",
    ],
  },
  {
    title: "Week 3: Control & Planning",
    items: [
      "PID + feedforward tuning",
      "Navigation stack (Nav2) and mapping",
      "State machines & behavior trees",
    ],
  },
  {
    title: "Week 4: Integration Sprint",
    items: [
      "Full-stack demo build",
      "Cloud deployment & monitoring",
      "Project report + demo day",
    ],
  },
];

const skills = [
  "ROS2 & URDF authoring",
  "Perception with OpenCV/MediaPipe",
  "Navigation & SLAM basics",
  "Edge deployment (Jetson/TPU)",
  "Version control & CI hygiene",
  "Technical reporting",
];

const outcomes = [
  "Ship a working robotics mini-project with demo video",
  "Publish a brief technical report / blog-ready summary",
  "Receive a certificate with mentor review notes",
  "Get feedback for next steps (career/research)",
];

const Internship = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-background via-primary/5 to-secondary/10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 bg-[length:50px_50px] opacity-20" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 text-center relative z-10 space-y-6">
          <Badge variant="secondary" className="mx-auto w-fit px-4 py-1.5 text-sm font-medium">
            <GraduationCap className="w-3 h-3 mr-2" />
            Robotics Internship / Training
          </Badge>
          <h1 className="text-5xl lg:text-7xl font-display font-bold bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
            Structured Internship & Training
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A comprehensive 4-week, mentor-led program covering perception, control, and
            integration—culminating in a demo-ready project and professional certificate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/contact">
              <Button size="lg" className="gap-2 px-8 h-12 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                <Rocket className="w-5 h-5" />
                Apply Now
              </Button>
            </Link>
            <a
              href="https://drive.google.com/uc?export=download&id=1Zt-internship-brochure"
              target="_blank"
              rel="noreferrer"
            >
              <Button size="lg" variant="outline" className="gap-2 px-8 h-12 text-lg font-semibold border-2 hover:bg-muted transition-all hover:scale-105">
                <FileText className="w-5 h-5" />
                Download Brochure
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Key Info Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4 grid lg:grid-cols-3 gap-6">
          <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Timer className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold">Duration</CardTitle>
              <CardDescription className="text-base font-medium text-primary">4 weeks · 8-10 hrs/week</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Live mentor hours + async labs. Flexible around academics.
            </CardContent>
          </Card>
          <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold">Tracks</CardTitle>
              <CardDescription className="text-base font-medium text-primary">Perception · Control · Integration</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Build one end-to-end robotics mini-project with clear milestones.
            </CardContent>
          </Card>
          <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold">Format</CardTitle>
              <CardDescription className="text-base font-medium text-primary">Hybrid / remote-friendly</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Remote labs with optional on-site demo day when available.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Weekly Roadmap */}
      <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="w-3 h-3 mr-2" />
              Learning Path
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-display font-bold mb-4">Weekly Roadmap</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Clear milestones you can track with mentors and peers throughout your journey.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {weeks.map((week, index) => (
              <Card key={week.title} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:bg-primary/20 transition-colors">
                      {index + 1}
                    </div>
                    <CardTitle className="text-xl font-bold">{week.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {week.items.map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm group/item">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                      <span className="text-muted-foreground leading-relaxed">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Skills & Outcomes */}
      <section className="py-16">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-8 items-start">
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold mb-2">Skills You'll Gain</CardTitle>
              <CardDescription className="text-base">
                Practical, resume-ready outcomes with code you can reuse.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              {skills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-start gap-3 text-sm p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors group"
                >
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-foreground font-medium">{skill}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold mb-2">Project Outcomes & Certification</CardTitle>
              <CardDescription className="text-base">
                Clear deliverables and proof of work.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {outcomes.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 text-sm p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors group"
                >
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-foreground font-medium">{item}</span>
                </div>
              ))}
              <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <p className="text-sm text-foreground leading-relaxed mb-4">
                  <strong className="text-primary">Certificate samples</strong> available on request; includes mentor signature,
                  project summary, and skills checklist.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg border-2 border-primary/30 flex flex-col items-center justify-center p-4 text-center">
                    <Award className="w-12 h-12 text-primary mb-2" />
                    <p className="text-xs font-semibold text-primary">Completion Certificate</p>
                    <p className="text-xs text-muted-foreground mt-1">With mentor signature</p>
                  </div>
                  <div className="aspect-[3/4] bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-lg border-2 border-secondary/30 flex flex-col items-center justify-center p-4 text-center">
                    <FileText className="w-12 h-12 text-secondary mb-2" />
                    <p className="text-xs font-semibold text-secondary">Skills Certificate</p>
                    <p className="text-xs text-muted-foreground mt-1">Verified skills checklist</p>
                  </div>
                </div>
                <a
                  href="https://drive.google.com/uc?export=download&id=1Zt-certificate-sample"
                  target="_blank"
                  rel="noreferrer"
                  className="block mt-4"
                >
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <FileText className="w-4 h-4" />
                    View Certificate Sample
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 bg-gradient-to-r from-primary via-primary/95 to-secondary overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 bg-[length:50px_50px] opacity-10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            Ready to level up in robotics?
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
            Submit your application with your background; we'll share the exact lab kit
            list and match you with a mentor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" variant="secondary" className="gap-2 px-8 h-12 text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                <Rocket className="w-5 h-5" />
                Apply for Next Cohort
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="gap-2 px-8 h-12 text-lg font-semibold border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all hover:scale-105">
                <GraduationCap className="w-5 h-5" />
                Meet the Mentors
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Internship;

