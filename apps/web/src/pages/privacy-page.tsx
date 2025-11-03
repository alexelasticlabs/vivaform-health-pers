import { Link } from "react-router-dom";

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-primary hover:underline"
      >
        ← Back to Home
      </Link>
      
      <h1 className="mb-8 text-4xl font-bold text-foreground">Privacy Policy</h1>
      
      <div className="prose prose-slate max-w-none dark:prose-invert">
        <p className="text-muted-foreground">
          Last updated: November 4, 2025
        </p>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-foreground">1. Information We Collect</h2>
          <p className="mt-4 text-muted-foreground">
            We collect information you provide directly to us, including:
          </p>
          <ul className="mt-4 list-disc pl-6 text-muted-foreground">
            <li>Account information (email, password)</li>
            <li>Profile data (height, weight, dietary preferences)</li>
            <li>Nutrition tracking data (meals, water intake)</li>
            <li>Health metrics (weight history)</li>
            <li>Quiz responses and personalization preferences</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-foreground">2. How We Use Your Information</h2>
          <p className="mt-4 text-muted-foreground">
            We use the information we collect to:
          </p>
          <ul className="mt-4 list-disc pl-6 text-muted-foreground">
            <li>Provide and improve VivaForm services</li>
            <li>Generate personalized meal plans and recommendations</li>
            <li>Send you important updates and notifications</li>
            <li>Process payments through Stripe (for Premium subscriptions)</li>
            <li>Analyze usage patterns to improve our service</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-foreground">3. Data Security</h2>
          <p className="mt-4 text-muted-foreground">
            We implement industry-standard security measures to protect your data:
          </p>
          <ul className="mt-4 list-disc pl-6 text-muted-foreground">
            <li>End-to-end encryption for data transmission (HTTPS)</li>
            <li>Secure password hashing using Argon2</li>
            <li>JWT tokens with refresh token rotation</li>
            <li>Rate limiting to prevent abuse</li>
            <li>Regular security audits</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-foreground">4. Third-Party Services</h2>
          <p className="mt-4 text-muted-foreground">
            We use the following third-party services:
          </p>
          <ul className="mt-4 list-disc pl-6 text-muted-foreground">
            <li><strong>Stripe:</strong> Payment processing (subject to Stripe's Privacy Policy)</li>
            <li><strong>Apple Health / Google Fit:</strong> Optional health data synchronization</li>
            <li><strong>Meta Pixel & Google Ads:</strong> Marketing analytics</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-foreground">5. Your Rights</h2>
          <p className="mt-4 text-muted-foreground">
            You have the right to:
          </p>
          <ul className="mt-4 list-disc pl-6 text-muted-foreground">
            <li>Access your personal data</li>
            <li>Request data correction or deletion</li>
            <li>Export your data in CSV format (Premium feature)</li>
            <li>Opt-out of marketing communications</li>
            <li>Delete your account at any time</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-foreground">6. Contact Us</h2>
          <p className="mt-4 text-muted-foreground">
            If you have questions about this Privacy Policy, please contact us at:
            <br />
            <a href="mailto:privacy@vivaform.com" className="text-primary hover:underline">
              privacy@vivaform.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
