import { Link } from "react-router-dom";
import { Cookie, Settings, Eye, BarChart3, Shield } from "lucide-react";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-card rounded-lg shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">Cookie Policy</h1>
            </div>
            <p className="text-muted-foreground">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit our website. They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This Cookie Policy explains how Techligence ("we," "us," or "our") uses cookies and similar tracking technologies on our website{" "}
              <a href="https://www.techligencerobotics.com" className="text-primary hover:underline">www.techligencerobotics.com</a>{" "}
              and how you can control them.
            </p>
          </section>

          {/* Types of Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              2. Types of Cookies We Use
            </h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-4">2.1 Essential Cookies</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These cookies are necessary for the website to function properly. They enable core functionality such as:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li>User authentication and session management</li>
              <li>Shopping cart functionality</li>
              <li>Security features and fraud prevention</li>
              <li>Remembering your preferences and settings</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Duration:</strong> Session cookies (deleted when you close your browser) or persistent cookies (remain until expiration or deletion)
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Can I opt-out?</strong> No, these cookies are essential and cannot be disabled without affecting website functionality.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.2 Performance and Analytics Cookies</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li>Page views and navigation patterns</li>
              <li>Time spent on pages</li>
              <li>Error messages and loading times</li>
              <li>Traffic sources and referral information</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Purpose:</strong> Improve website performance, user experience, and identify areas for optimization
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Can I opt-out?</strong> Yes, you can disable these through your browser settings or our cookie consent banner
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.3 Functionality Cookies</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These cookies allow the website to remember choices you make and provide enhanced, personalized features:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li>Language preferences</li>
              <li>Region or location settings</li>
              <li>User interface preferences (theme, layout)</li>
              <li>Remembering login information (if you choose)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Can I opt-out?</strong> Yes, but disabling these may limit some personalized features
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.4 Targeting and Advertising Cookies</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These cookies are used to deliver relevant advertisements and track campaign effectiveness:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li>Track your browsing habits across websites</li>
              <li>Build a profile of your interests</li>
              <li>Show you relevant ads on other websites</li>
              <li>Measure ad campaign performance</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Can I opt-out?</strong> Yes, you can opt-out through our cookie consent banner or browser settings
            </p>
          </section>

          {/* Specific Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary" />
              3. Specific Cookies We Use
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border mt-4">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-3 text-left">Cookie Name</th>
                    <th className="border border-border p-3 text-left">Purpose</th>
                    <th className="border border-border p-3 text-left">Duration</th>
                    <th className="border border-border p-3 text-left">Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3 font-mono text-sm">auth_token</td>
                    <td className="border border-border p-3">User authentication and session management</td>
                    <td className="border border-border p-3">7 days</td>
                    <td className="border border-border p-3">Essential</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-mono text-sm">cart_items</td>
                    <td className="border border-border p-3">Shopping cart contents</td>
                    <td className="border border-border p-3">Session</td>
                    <td className="border border-border p-3">Essential</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-mono text-sm">user_preferences</td>
                    <td className="border border-border p-3">User interface and display preferences</td>
                    <td className="border border-border p-3">1 year</td>
                    <td className="border border-border p-3">Functionality</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-mono text-sm">cookie_consent</td>
                    <td className="border border-border p-3">Stores your cookie preferences</td>
                    <td className="border border-border p-3">1 year</td>
                    <td className="border border-border p-3">Essential</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-mono text-sm">_ga, _gid</td>
                    <td className="border border-border p-3">Google Analytics (if enabled)</td>
                    <td className="border border-border p-3">2 years / 24 hours</td>
                    <td className="border border-border p-3">Analytics</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may use third-party services that set cookies on your device. These include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li><strong>Payment Processors (Razorpay):</strong> Cookies for secure payment processing and fraud prevention</li>
              <li><strong>Email Services (Mailgun):</strong> Tracking pixels in emails to measure open rates (if enabled)</li>
              <li><strong>Analytics Services:</strong> Google Analytics or similar services for website analytics (if enabled)</li>
              <li><strong>Social Media:</strong> Cookies from social media platforms if you interact with social features</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              These third parties have their own privacy policies and cookie practices. We encourage you to review their policies.
            </p>
          </section>

          {/* Managing Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              5. How to Manage Cookies
            </h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-4">5.1 Cookie Consent Banner</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you first visit our website, you'll see a cookie consent banner. You can:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li>Accept all cookies</li>
              <li>Reject non-essential cookies</li>
              <li>Customize your cookie preferences</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">5.2 Browser Settings</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li>Block all cookies</li>
              <li>Block third-party cookies</li>
              <li>Delete existing cookies</li>
              <li>Set preferences for specific websites</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Browser-specific instructions:</strong>
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
              <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">5.3 Opt-Out Tools</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You can also use industry opt-out tools:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li><a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Your Online Choices</a> - European Interactive Digital Advertising Alliance</li>
              <li><a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Digital Advertising Alliance</a> - US-based opt-out</li>
              <li>Network Advertising Initiative opt-out page</li>
            </ul>
          </section>

          {/* Impact of Disabling */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Impact of Disabling Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you disable cookies, some features of our website may not function properly:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li>You may need to log in repeatedly</li>
              <li>Shopping cart may not save items</li>
              <li>Personalized features may be unavailable</li>
              <li>Some pages may load incorrectly</li>
              <li>Robot control sessions may not persist</li>
            </ul>
          </section>

          {/* Do Not Track */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Do Not Track Signals</h2>
            <p className="text-muted-foreground leading-relaxed">
              Some browsers include a "Do Not Track" (DNT) feature that signals to websites you visit that you do not want to have your online activity tracked. Currently, there is no standard for how DNT signals should be interpreted. We do not currently respond to DNT browser signals. However, you can control tracking through our cookie consent banner and browser settings.
            </p>
          </section>

          {/* Updates */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Updates to This Cookie Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              9. Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have questions about our use of cookies, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="font-semibold">Techligence</p>
              <p className="text-muted-foreground">
                Email: <a href="mailto:info@techligence.net" className="text-primary hover:underline">info@techligence.net</a>
              </p>
              <p className="text-muted-foreground">
                Phone: <a href="tel:+917020812247" className="text-primary hover:underline">+91 70208 12247</a>
              </p>
              <p className="text-muted-foreground">
                Address: Saptagiri Building, Lokdhara Phase 3, Near Ganesh Nagar, Kalyan, Maharashtra, 421306, India
              </p>
            </div>
          </section>

          {/* Links */}
          <section className="mt-12 pt-8 border-t">
            <p className="text-muted-foreground mb-4">Related Policies:</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/privacy-policy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-primary hover:underline">
                Terms of Service
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

export default CookiePolicy;

