import { Link } from "react-router-dom";
import { Shield, CheckCircle, FileText, Mail, Lock, Download, Trash2 } from "lucide-react";

const GDPR = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-card rounded-lg shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">GDPR Compliance</h1>
            </div>
            <p className="text-muted-foreground">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The General Data Protection Regulation (GDPR) is a European Union (EU) regulation that came into effect on May 25, 2018. It provides individuals with greater control over their personal data and imposes obligations on organizations that process personal data of EU residents.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Techligence is committed to GDPR compliance and protecting the privacy rights of all our users, including those in the European Economic Area (EEA). This page explains how we comply with GDPR requirements and your rights under GDPR.
            </p>
          </section>

          {/* Our Commitment */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-primary" />
              2. Our GDPR Commitment
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We are committed to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li>Processing personal data lawfully, fairly, and transparently</li>
              <li>Collecting only necessary data for specified purposes</li>
              <li>Ensuring data accuracy and keeping it up to date</li>
              <li>Retaining data only for as long as necessary</li>
              <li>Implementing appropriate security measures</li>
              <li>Respecting your rights regarding your personal data</li>
            </ul>
          </section>

          {/* Legal Basis */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Legal Basis for Processing</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Under GDPR, we process your personal data based on the following legal bases:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li><strong>Consent:</strong> When you explicitly consent to processing (e.g., marketing emails, cookie preferences)</li>
              <li><strong>Contract Performance:</strong> To fulfill our contract with you (e.g., processing orders, providing services)</li>
              <li><strong>Legal Obligation:</strong> To comply with legal requirements (e.g., tax records, accounting)</li>
              <li><strong>Legitimate Interests:</strong> For our legitimate business interests (e.g., website security, fraud prevention, improving services)</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              4. Your Rights Under GDPR
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              As an EU resident, you have the following rights regarding your personal data:
            </p>

            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  4.1 Right to Access
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  You have the right to request a copy of the personal data we hold about you, including what data we have, why we have it, and who we share it with.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  4.2 Right to Data Portability
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  You have the right to receive your personal data in a structured, commonly used, and machine-readable format and to transmit that data to another controller.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  4.3 Right to Rectification
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  You have the right to have inaccurate personal data corrected and incomplete data completed.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  4.4 Right to Erasure ("Right to be Forgotten")
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  You have the right to request deletion of your personal data in certain circumstances, such as when the data is no longer necessary for the original purpose or you withdraw consent.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  4.5 Right to Restrict Processing
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  You have the right to request that we limit how we use your personal data in certain circumstances.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">4.6 Right to Object</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You have the right to object to processing of your personal data based on legitimate interests or for direct marketing purposes.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">4.7 Right to Withdraw Consent</h3>
                <p className="text-muted-foreground leading-relaxed">
                  When processing is based on consent, you have the right to withdraw your consent at any time. Withdrawal does not affect the lawfulness of processing before withdrawal.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">4.8 Right to Lodge a Complaint</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You have the right to lodge a complaint with a supervisory authority if you believe we have violated your data protection rights. In the EU, you can contact your local data protection authority.
                </p>
              </div>
            </div>
          </section>

          {/* Exercising Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. How to Exercise Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To exercise any of your GDPR rights, please contact us using the information provided in Section 8. We will:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li>Respond to your request within one month (may be extended by two months for complex requests)</li>
              <li>Verify your identity before processing your request</li>
              <li>Provide information free of charge (unless requests are manifestly unfounded or excessive)</li>
              <li>Explain any refusal to comply with your request</li>
            </ul>
          </section>

          {/* Data Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your personal data may be transferred to and processed in countries outside the EEA, including India (where our servers are located). When we transfer data outside the EEA, we ensure appropriate safeguards are in place:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
              <li>Adequacy decisions by the European Commission</li>
              <li>Other legally recognized transfer mechanisms</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Our third-party service providers (e.g., Razorpay, Mailgun, hosting providers) may also process your data outside the EEA. We ensure they have appropriate safeguards in place.
            </p>
          </section>

          {/* Data Protection Officer */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Protection Officer</h2>
            <p className="text-muted-foreground leading-relaxed">
              While we may not be required to appoint a Data Protection Officer (DPO) under GDPR, we have designated a privacy contact person. For any GDPR-related inquiries, please contact us using the information in Section 8.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary" />
              8. Contact Us for GDPR Requests
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To exercise your GDPR rights or for any GDPR-related inquiries, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="font-semibold">Techligence</p>
              <p className="text-muted-foreground">
                Email: <a href="mailto:info@techligence.net" className="text-primary hover:underline">info@techligence.net</a>
              </p>
              <p className="text-muted-foreground">
                Subject Line: "GDPR Request - [Your Request Type]"
              </p>
              <p className="text-muted-foreground">
                Phone: <a href="tel:+917020812247" className="text-primary hover:underline">+91 70208 12247</a>
              </p>
              <p className="text-muted-foreground">
                Address: Saptagiri Building, Lokdhara Phase 3, Near Ganesh Nagar, Kalyan, Maharashtra, 421306, India
              </p>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>Please include in your request:</strong>
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li>Your full name and email address associated with your account</li>
              <li>Description of the right you wish to exercise</li>
              <li>Any additional information that may help us process your request</li>
            </ul>
          </section>

          {/* Updates */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Updates to This GDPR Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this GDPR information page from time to time to reflect changes in our practices or legal requirements. We will notify you of material changes by posting the updated information on this page and updating the "Last Updated" date.
            </p>
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
              <Link to="/cookie-policy" className="text-primary hover:underline">
                Cookie Policy
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GDPR;

