import { Link } from "react-router-dom";
import { Shield, Lock, Eye, Database, Users, Mail, Phone } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-card rounded-lg shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-muted-foreground">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Welcome to Techligence ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and in using our products and services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website{" "}
              <a href="https://www.techligencerobotics.com" className="text-primary hover:underline">www.techligencerobotics.com</a>{" "}
              and use our robotics platform, products, and services.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              By using our website and services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-primary" />
              2. Information We Collect
            </h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-4">2.1 Personal Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li><strong>Account Information:</strong> Name, email address, phone number, and password when you create an account</li>
              <li><strong>Purchase Information:</strong> Billing address, shipping address, payment information (processed securely through Razorpay), and order history</li>
              <li><strong>Contact Information:</strong> Information provided when you contact us through our contact forms, including name, email, company, and inquiry type</li>
              <li><strong>Career Applications:</strong> Resume, cover letter, personal details, and employment history when you apply for positions</li>
              <li><strong>Communication Data:</strong> Records of correspondence when you interact with our customer support or chatbot</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.2 Automatically Collected Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you visit our website, we automatically collect certain information:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on pages, click patterns, search queries</li>
              <li><strong>Location Data:</strong> General geographic location based on IP address</li>
              <li><strong>Cookies and Tracking Technologies:</strong> See our Cookie Policy for detailed information</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.3 ML Tools and Robot Control Data</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When using our Machine Learning tools and robot control features:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li><strong>Camera Data:</strong> Images and video feeds processed locally for face recognition, gesture detection, and other ML features</li>
              <li><strong>URDF Models:</strong> Robot model files you upload for visualization and control</li>
              <li><strong>Control Commands:</strong> Robot control instructions and commands sent through our platform</li>
              <li><strong>Session Data:</strong> Temporary data stored during active robot control sessions</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Note:</strong> Most ML processing occurs locally in your browser. We do not store or transmit raw camera feeds or personal biometric data unless explicitly required for a service you've requested.
            </p>
          </section>

          {/* How We Use Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary" />
              3. How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the collected information for various purposes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li><strong>Service Delivery:</strong> Process orders, provide robot control services, deliver ML tools, and manage your account</li>
              <li><strong>Communication:</strong> Send order confirmations, OTP codes via email (Mailgun), respond to inquiries, and provide customer support</li>
              <li><strong>Improvement:</strong> Analyze usage patterns to improve our website, products, and services</li>
              <li><strong>Marketing:</strong> Send promotional emails (with your consent) about new products, features, and company updates</li>
              <li><strong>Security:</strong> Detect and prevent fraud, unauthorized access, and other security threats</li>
              <li><strong>Legal Compliance:</strong> Comply with legal obligations, resolve disputes, and enforce our agreements</li>
              <li><strong>Career Processing:</strong> Evaluate job applications and communicate with candidates</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              4. Information Sharing and Disclosure
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (payment processing via Razorpay, email delivery via Mailgun, hosting services)</li>
              <li><strong>Business Transfers:</strong> In connection with any merger, sale of assets, or acquisition</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
              <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety, or that of our users</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary" />
              5. Data Security
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li>Encryption of data in transit (HTTPS/TLS)</li>
              <li>Secure password hashing (bcrypt) for account credentials</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication requirements</li>
              <li>Secure payment processing through PCI-DSS compliant providers (Razorpay)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information in your account</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal retention requirements)</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails using the link in our emails</li>
              <li><strong>Data Portability:</strong> Request your data in a portable format</li>
              <li><strong>Cookie Preferences:</strong> Manage cookie settings through your browser or our cookie consent banner</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              To exercise these rights, please contact us using the information provided in Section 9.
            </p>
          </section>

          {/* Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li><strong>Account Data:</strong> Retained while your account is active and for 2 years after account closure</li>
              <li><strong>Order Data:</strong> Retained for 7 years for tax and accounting purposes</li>
              <li><strong>Contact Form Data:</strong> Retained for 2 years unless you request earlier deletion</li>
              <li><strong>Career Applications:</strong> Retained for 1 year after the application date</li>
              <li><strong>ML Tool Session Data:</strong> Processed locally and not stored on our servers</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us, and we will take steps to delete such information.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary" />
              9. Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="font-semibold">Techligence</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@techligence.net" className="hover:text-foreground transition-colors">
                  info@techligence.net
                </a>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <a href="tel:+917020812247" className="hover:text-foreground transition-colors">
                  +91 70208 12247
                </a>
              </div>
              <p className="text-muted-foreground">
                Saptagiri Building, Lokdhara Phase 3,<br />
                Near Ganesh Nagar, Kalyan,<br />
                Maharashtra, 421306, India
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          {/* Links */}
          <section className="mt-12 pt-8 border-t">
            <p className="text-muted-foreground mb-4">Related Policies:</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/terms-of-service" className="text-primary hover:underline">
                Terms of Service
              </Link>
              <Link to="/cookie-policy" className="text-primary hover:underline">
                Cookie Policy
              </Link>
              <Link to="/gdpr" className="text-primary hover:underline">
                GDPR Compliance
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

