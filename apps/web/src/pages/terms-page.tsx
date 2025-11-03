import { Link } from "react-router-dom";

export function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-primary hover:underline"
      >
        ← Back to Home
      </Link>
      
      <h1 className="mb-8 text-4xl font-bold text-foreground">Terms of Service</h1>
      
      <div className="prose prose-slate max-w-none dark:prose-invert">
        <p className="text-muted-foreground">
          Last updated: November 4, 2025
        </p>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p className="mt-4 text-muted-foreground">
            By accessing and using VivaForm, you accept and agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-foreground">2. Service Description</h2>
          <p className="mt-4 text-muted-foreground">
            VivaForm provides nutrition tracking, meal planning, and health recommendations.
            We offer both free and premium subscription plans.
          </p>
          <p className="mt-4 text-muted-foreground">
            <strong>Free Plan:</strong> Basic nutrition tracking, water intake, weight tracking.
          </p>
          <p className="mt-2 text-muted-foreground">
            <strong>Premium Plans:</strong> Personalized meal plans, AI recommendations, advanced analytics,
            and integrations with Apple Health / Google Fit.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-foreground">3. User Accounts</h2>
          <p className="mt-4 text-muted-foreground">
            You are responsible for:
          </p>
          <ul className="mt-4 list-disc pl-6 text-muted-foreground">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Providing accurate and complete information</li>
            <li>Notifying us immediately of any unauthorized access</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-foreground">4. Premium Subscriptions</h2>
          <p className="mt-4 text-muted-foreground">
            Premium subscriptions are billed as follows:
          </p>
          <ul className="mt-4 list-disc pl-6 text-muted-foreground">
            <li><strong>Monthly:</strong> $4.87/month, billed monthly</li>
            <li><strong>Quarterly:</strong> $17.63 for 4 months (~10% savings)</li>
            <li><strong>Annual:</strong> $28.76 for 12 months (~50% savings)</li>
          </ul>
          <p className="mt-4 text-muted-foreground">
            Subscriptions automatically renew unless canceled. You can cancel at any time through
            your account settings. After cancellation, you retain access until the end of the paid period.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-foreground">5. Payment and Refunds</h2>
          <p className="mt-4 text-muted-foreground">
            All payments are processed securely through Stripe. We do not store your credit card information.
          </p>
          <p className="mt-4 text-muted-foreground">
            Refund policy: You may request a refund within 7 days of purchase if you haven't used
            premium features extensively.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-foreground">6. Prohibited Activities</h2>
          <p className="mt-4 text-muted-foreground">
            You may not:
          </p>
          <ul className="mt-4 list-disc pl-6 text-muted-foreground">
            <li>Use the service for illegal purposes</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Share your account credentials with others</li>
            <li>Scrape or copy content from the service</li>
            <li>Interfere with the service's operation</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-foreground">7. Medical Disclaimer</h2>
          <p className="mt-4 text-muted-foreground">
            <strong>Important:</strong> VivaForm provides general nutrition information and recommendations
            but is not a substitute for professional medical advice. Always consult with a healthcare
            provider before starting any diet or exercise program.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-foreground">8. Limitation of Liability</h2>
          <p className="mt-4 text-muted-foreground">
            VivaForm is provided "as is" without warranties of any kind. We are not liable for
            any damages resulting from your use of the service.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-foreground">9. Changes to Terms</h2>
          <p className="mt-4 text-muted-foreground">
            We may update these Terms of Service from time to time. We will notify you of significant
            changes via email or through the service.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-foreground">10. Contact Us</h2>
          <p className="mt-4 text-muted-foreground">
            For questions about these Terms of Service, contact us at:
            <br />
            <a href="mailto:support@vivaform.com" className="text-primary hover:underline">
              support@vivaform.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
