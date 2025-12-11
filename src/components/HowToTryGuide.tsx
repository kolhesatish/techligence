import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PlayCircle, 
  MousePointerClick, 
  Video, 
  Code, 
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  BookOpen
} from "lucide-react";
import { Link } from "react-router-dom";
import { analytics } from "@/services/analytics";

const HowToTryGuide = () => {
  const steps = [
    {
      number: 1,
      title: "Access the Controller",
      description: "Navigate to the R.T. Controller page and click 'Get Started'",
      icon: MousePointerClick,
      action: {
        label: "Go to Controller",
        path: "/controller",
        event: "cta_click_guide_controller"
      }
    },
    {
      number: 2,
      title: "Sign In or Sign Up",
      description: "Create a free account or sign in with existing credentials",
      icon: CheckCircle2,
      action: {
        label: "Sign In",
        path: "/auth",
        event: "cta_click_guide_auth"
      }
    },
    {
      number: 3,
      title: "Enable Camera Access",
      description: "Allow browser camera permissions for gesture recognition",
      icon: Video,
      action: null
    },
    {
      number: 4,
      title: "Start Gesture Control",
      description: "Use hand gestures to control the robot in real-time",
      icon: PlayCircle,
      action: {
        label: "Try Demo",
        path: "/controller/advanced-urdf-controller",
        event: "cta_click_guide_demo"
      }
    },
  ];

  const handleCTAClick = (event: string, path: string) => {
    analytics.trackCTAClick(event, path);
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">How to Try the Demo</CardTitle>
        </div>
        <p className="text-muted-foreground">
          Get started with our live robotics controller in just a few simple steps
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50 hover:border-primary/30 transition-all group"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:bg-primary/20 transition-colors">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-foreground mb-1">{step.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {step.action && (
                    <div className="mt-3 ml-8">
                      <Link to={step.action.path}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
                          onClick={() => handleCTAClick(step.action!.event, step.action!.path)}
                        >
                          {step.action.label}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Start CTA */}
        <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-2 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-lg mb-2">Ready to Start?</h4>
              <p className="text-sm text-muted-foreground">
                Launch the controller and experience gesture-based robot control
              </p>
            </div>
            <Link to="/controller">
              <Button
                size="lg"
                className="gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                onClick={() => {
                  analytics.trackCTAClick('cta_click_guide_quick_start', '/controller');
                  analytics.trackDemoStart();
                }}
              >
                <PlayCircle className="w-5 h-5" />
                Quick Start
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Requirements */}
        <div className="pt-4 border-t border-border/50">
          <h5 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
            Requirements
          </h5>
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Modern browser (Chrome, Firefox, Edge)
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Webcam or camera-enabled device
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Stable internet connection
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Free account (sign up in seconds)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HowToTryGuide;

