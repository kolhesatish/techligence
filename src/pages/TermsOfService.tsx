import { Link } from "react-router-dom";
import { FileText, AlertCircle, ShoppingCart, CreditCard, Shield, XCircle } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-card rounded-lg shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">Terms of Service</h1>
            </div>
            <p className="text-muted-foreground">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and Techligence ("Company," "we," "us," or "our") regarding your use of our website{" "}
              <a href="https://www.techligencerobotics.com" className="text-primary hover:underline">www.techligencerobotics.com</a>{" "}
              and our robotics platform, products, and services (collectively, the "Services").
            </p>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using our Services, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access or use our Services.
            </p>
          </section>

          {/* Eligibility */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Eligibility and Account Registration</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">2.1 Age Requirement</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You must be at least 18 years old to use our Services. By using our Services, you represent and warrant that you are of legal age to form a binding contract.
            </p>
            
            <h3 className="text-xl font-semibold mb-3 mt-4">2.2 Account Creation</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To access certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          {/* Use of Services */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              3. Acceptable Use
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree to use our Services only for lawful purposes and in accordance with these Terms. You agree NOT to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon intellectual property rights</li>
              <li>Transmit harmful code, viruses, or malware</li>
              <li>Attempt unauthorized access to our systems or other users' accounts</li>
              <li>Use automated systems (bots, scrapers) without permission</li>
              <li>Interfere with or disrupt the Services</li>
              <li>Impersonate others or provide false information</li>
              <li>Use the Services for any illegal or unauthorized purpose</li>
              <li>Collect or harvest information about other users</li>
              <li>Use robot control features in a manner that could cause harm or damage</li>
            </ul>
          </section>

          {/* Products and Purchases */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-primary" />
              4. Products, Pricing, and Purchases
            </h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-4">4.1 Product Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We strive to provide accurate product descriptions, images, and pricing. However, we do not warrant that product descriptions or other content is accurate, complete, or error-free.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.2 Pricing</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All prices are displayed in Indian Rupees (INR) and are subject to change without notice. Prices do not include applicable taxes, shipping, or handling charges, which will be added at checkout.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.3 Payment</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Payment is processed securely through Razorpay. By making a purchase, you agree to provide valid payment information. You represent and warrant that you have the legal right to use any payment method you provide.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.4 Order Acceptance</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your order is an offer to purchase. We reserve the right to accept or reject your order for any reason, including product availability, errors in pricing, or suspected fraud.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.5 OTP Verification</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For security purposes, we require email verification via OTP (One-Time Password) before processing certain transactions. You must provide a valid email address and verify the OTP to complete your purchase.
            </p>
          </section>

          {/* Returns and Refunds */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Returns, Refunds, and Cancellations</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">5.1 Return Policy</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Returns are accepted within 7 days of delivery, provided the product is unused, in original packaging, and in resalable condition. Custom or personalized products may not be returnable.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">5.2 Refunds</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Refunds will be processed to the original payment method within 7-14 business days after we receive and inspect the returned product. Shipping costs are non-refundable unless the product is defective or we made an error.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">5.3 Order Cancellation</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You may cancel an order before it ships. Once an order has shipped, standard return procedures apply. Contact us at{" "}
              <a href="mailto:info@techligence.net" className="text-primary hover:underline">info@techligence.net</a>{" "}
              to cancel an order.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Services, including all content, features, functionality, software, designs, logos, trademarks, and other materials, are owned by Techligence or its licensors and are protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You are granted a limited, non-exclusive, non-transferable license to access and use the Services for personal or internal business purposes. You may not:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li>Copy, modify, or create derivative works</li>
              <li>Reverse engineer, decompile, or disassemble</li>
              <li>Remove copyright or proprietary notices</li>
              <li>Use our trademarks or logos without permission</li>
            </ul>
          </section>

          {/* ML Tools and Robot Control */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Machine Learning Tools and Robot Control</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">7.1 ML Tools Usage</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our ML tools (face recognition, gesture detection, etc.) process data locally in your browser. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li>Obtaining necessary permissions before processing images or video of others</li>
              <li>Complying with applicable privacy laws and regulations</li>
              <li>Using the tools in a lawful and ethical manner</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">7.2 Robot Control</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When using our robot control features:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li>You are responsible for the safe operation of connected robots</li>
              <li>You must ensure adequate safety measures are in place</li>
              <li>We are not liable for damage or injury resulting from robot operation</li>
              <li>URDF models you upload remain your property, but you grant us a license to process them for our Services</li>
            </ul>
          </section>

          {/* Disclaimers */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-primary" />
              8. Disclaimers
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li>Implied warranties of merchantability, fitness for a particular purpose, and non-infringement</li>
              <li>Warranties that the Services will be uninterrupted, secure, or error-free</li>
              <li>Warranties regarding the accuracy, reliability, or quality of any information obtained through the Services</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              We do not warrant that defects will be corrected or that the Services are free of viruses or other harmful components.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, TECHLIGENCE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
              <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
              <li>Damages resulting from your use or inability to use the Services</li>
              <li>Damages resulting from unauthorized access to or alteration of your data</li>
              <li>Damages resulting from robot operation or ML tool usage</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Our total liability for any claims arising from or related to the Services shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          {/* Indemnification */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify, defend, and hold harmless Techligence and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) arising out of or in any way connected with your use of the Services, violation of these Terms, or infringement of any rights of another.
            </p>
          </section>

          {/* Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-primary" />
              11. Termination
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may terminate or suspend your account and access to the Services immediately, without prior notice, for any reason, including if you breach these Terms.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Upon termination, your right to use the Services will cease immediately. You may terminate your account at any time by contacting us or using account deletion features in your account settings.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law and Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Any disputes arising out of or relating to these Terms or the Services shall be subject to the exclusive jurisdiction of the courts in Kalyan, Maharashtra, India.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We encourage you to contact us first to resolve any disputes amicably before pursuing legal action.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on this page and updating the "Last Updated" date. Your continued use of the Services after such modifications constitutes acceptance of the updated Terms.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have questions about these Terms, please contact us:
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

export default TermsOfService;

