import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Target,
  Handshake,
  Users,
  History,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Lightbulb,
  Award,
  Globe,
  Briefcase,
} from "lucide-react";

const About = () => {
  const teamMembers = [
    {
      name: "Kunal Gawhale",
      role: "CEO & Co-founder",
      description:
        "A visionary in AI and robotics with 8+ years of experience in autonomous systems. Led development of multiple production robotics deployments. Expert in ROS2, computer vision, and edge AI.",
      image: "https://placehold.co/200x200/A0B9CE/FFFFFF?text=KG",
      expertise: ["ROS2", "Computer Vision", "Edge AI", "Product Strategy"],
      education: "M.S. Robotics Engineering",
      linkedin: "https://linkedin.com/in/kunalgawhale",
    },
    {
      name: "Piyush Shinde",
      role: "HR Head & Co-founder",
      description:
        "Specialist in human resources and talent development with a focus on building high-performing engineering teams. Expert in organizational culture and talent acquisition for tech companies.",
      image: "https://placehold.co/200x200/C0D9E0/FFFFFF?text=PS",
      expertise: ["Talent Acquisition", "Organizational Development", "Team Building"],
      education: "M.B.A. Human Resources",
      linkedin: "https://linkedin.com/in/piyushshinde",
    },
    {
      name: "Dr. Anjali Sharma",
      role: "Lead Robotics Engineer",
      description:
        "Ph.D. in Robotics with expertise in SLAM, navigation, and sensor fusion. Published researcher with 15+ papers in top robotics conferences. Leads our perception and navigation teams.",
      image: "https://placehold.co/200x200/D0E9F0/FFFFFF?text=AS",
      expertise: ["SLAM", "Navigation", "Sensor Fusion", "Research"],
      education: "Ph.D. Robotics",
      linkedin: "https://linkedin.com/in/anjali-sharma",
    },
    {
      name: "Rajesh Kumar",
      role: "Senior AI Engineer",
      description:
        "Expert in deep learning and computer vision with 6+ years building production ML systems. Specializes in real-time inference, model optimization, and edge deployment on Jetson platforms.",
      image: "https://placehold.co/200x200/E0F9F5/FFFFFF?text=RK",
      expertise: ["Deep Learning", "Computer Vision", "Edge ML", "TensorRT"],
      education: "M.S. Computer Science",
      linkedin: "https://linkedin.com/in/rajeshkumar",
    },
  ];

  const milestones = [
    {
      year: 2018,
      event:
        "Company Founded: Techligence established with a vision for autonomous robotics.",
    },
    {
      year: 2019,
      event:
        "First Prototype: Unveiled the initial 4WD exploration robot prototype.",
    },
    {
      year: 2021,
      event:
        "Series A Funding: Secured significant investment for R&D and expansion.",
    },
    {
      year: 2023,
      event:
        "Product Launch: Introduced the RoboTech Explorer Pro to the market.",
    },
    {
      year: 2024,
      event: "Global Expansion: Opened new offices in Europe and Asia.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-accent/20 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              <Lightbulb className="w-3 h-3 mr-1" />
              About Us
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
              Pioneering the Future of{" "}
              <span className="text-primary">Intelligent Robotics</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              At Techligence, we are dedicated to developing cutting-edge
              autonomous robotic solutions that empower industries and enrich
              lives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/career">
                <Button size="lg" className="gap-2 text-lg px-8">
                  Join Our Team
                  <Briefcase className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 text-lg px-8"
                >
                  Contact Us
                  <Mail className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed text-muted-foreground">
                  To innovate and deliver advanced robotic solutions that
                  enhance productivity, safety, and efficiency across diverse
                  industries.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed text-muted-foreground">
                  To be the global leader in intelligent robotics, creating a
                  future where humans and machines collaborate seamlessly.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Handshake className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Our Values</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-base leading-relaxed text-muted-foreground list-disc list-outside inline-block text-left">
                  <li>Innovation</li>
                  <li>Integrity</li>
                  <li>Excellence</li>
                  <li>Collaboration</li>
                  <li>Impact</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Users className="w-3 h-3 mr-1" />
              Our Leadership
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              Meet the Visionaries
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our team comprises brilliant minds and passionate innovators
              dedicated to pushing the boundaries of robotics.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-32 h-32 rounded-xl mx-auto sm:mx-0 object-cover border-2 border-primary/50 group-hover:border-primary transition-colors"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <CardTitle className="text-xl mb-1">{member.name}</CardTitle>
                      <p className="text-sm font-medium text-primary mb-2">
                        {member.role}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {member.description}
                      </p>
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-2">Education:</p>
                        <p className="text-sm font-medium">{member.education}</p>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-2">Expertise:</p>
                        <div className="flex flex-wrap gap-2">
                          {member.expertise?.map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                        >
                          LinkedIn <ArrowRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Credibility & Partnerships */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Badge variant="outline" className="mb-2 w-fit">
                  <Award className="w-3 h-3 mr-1" />
                  Credibility
                </Badge>
                <CardTitle>Why Teams Trust Techligence</CardTitle>
                <CardDescription>
                  Engineering-first culture with transparent delivery.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p>• Deployed robotics in production warehouses and clinics</p>
                <p>• Hardware + AI stack owned end-to-end (URDF to cloud)</p>
                <p>• Formal test reports and datasheets for every release</p>
                <p>• Security reviewed for enterprise rollouts</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Badge variant="outline" className="mb-2 w-fit">
                  <Globe className="w-3 h-3 mr-1" />
                  Partnerships
                </Badge>
                <CardTitle>Partners & Ecosystem</CardTitle>
                <CardDescription>
                  Collaborating with industry and academic labs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-foreground">Technology Partners</h4>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                        <img
                          src="https://placehold.co/120x40/EEF2F7/111827?text=ROS+Foundation"
                          alt="ROS Foundation"
                          className="h-10 object-contain mb-2"
                        />
                        <p className="text-xs text-muted-foreground">ROS Partner</p>
                      </div>
                      <div className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                        <img
                          src="https://placehold.co/120x40/EEF2F7/111827?text=NVIDIA+Jetson"
                          alt="NVIDIA Jetson"
                          className="h-10 object-contain mb-2"
                        />
                        <p className="text-xs text-muted-foreground">Edge AI Platform</p>
                      </div>
                      <div className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                        <img
                          src="https://placehold.co/120x40/EEF2F7/111827?text=OpenCV"
                          alt="OpenCV"
                          className="h-10 object-contain mb-2"
                        />
                        <p className="text-xs text-muted-foreground">Computer Vision</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-foreground">Academic Collaborations</h4>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                        <img
                          src="https://placehold.co/120x40/EEF2F7/111827?text=IIT+Bombay"
                          alt="IIT Bombay"
                          className="h-10 object-contain mb-2"
                        />
                        <p className="text-xs text-muted-foreground">Research Partner</p>
                      </div>
                      <div className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                        <img
                          src="https://placehold.co/120x40/EEF2F7/111827?text=IIIT+Hyderabad"
                          alt="IIIT Hyderabad"
                          className="h-10 object-contain mb-2"
                        />
                        <p className="text-xs text-muted-foreground">ML Research</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-foreground">Industry Partners</h4>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                        <img
                          src="https://placehold.co/120x40/EEF2F7/111827?text=Warehouse+Tech"
                          alt="Warehouse Technology"
                          className="h-10 object-contain mb-2"
                        />
                        <p className="text-xs text-muted-foreground">Logistics Partner</p>
                      </div>
                      <div className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                        <img
                          src="https://placehold.co/120x40/EEF2F7/111827?text=Healthcare+AI"
                          alt="Healthcare AI"
                          className="h-10 object-contain mb-2"
                        />
                        <p className="text-xs text-muted-foreground">Healthcare Solutions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our History/Milestones Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <History className="w-3 h-3 mr-1" />
              Our Journey
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              Milestones & Achievements
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A look back at the key moments that shaped Techligence into what
              it is today.
            </p>
          </div>
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-primary h-full hidden md:block"></div>
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`flex items-center w-full my-8 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className="w-full md:w-1/2 px-4">
                  <Card className="shadow-md">
                    <CardContent className="p-4">
                      <h3 className="text-xl font-semibold text-primary mb-2">
                        {milestone.year}
                      </h3>
                      <p className="text-muted-foreground">{milestone.event}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="w-1/2 md:w-1/2 flex justify-center relative">
                  <div className="w-4 h-4 bg-primary rounded-full absolute left-1/2 transform -translate-x-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards & Recognition Section (Optional) */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4">
            <Award className="w-3 h-3 mr-1" />
            Recognition
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
            Our Achievements
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Proudly recognized for our contributions to the robotics industry.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <img
              src="https://placehold.co/150x80/E0F0F5/000000?text=Award+1"
              alt="Award 1"
              className="h-20 object-contain"
            />
            <img
              src="https://placehold.co/150x80/E0F0F5/000000?text=Award+2"
              alt="Award 2"
              className="h-20 object-contain"
            />
            <img
              src="https://placehold.co/150x80/E0F0F5/000000?text=Award+3"
              alt="Award 3"
              className="h-20 object-contain"
            />
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
            Have Questions or Want to Collaborate?
          </h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            We'd love to hear from you. Reach out to our team for inquiries,
            partnerships, or career opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 text-lg px-8"
              >
                Contact Our Team
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/career">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-lg px-8 border-white text-white hover:bg-white hover:text-primary"
              >
                View Open Positions
                <Briefcase className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
