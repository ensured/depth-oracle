export default function PrivacyPolicy() {
  return (
    <footer className="border-t border-gray-200/5">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-6">Privacy Policy</h2>
        <p className="mb-8">Effective Date: October 19, 2025</p>
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">1. Introduction</h3>
            <p>
              At Depth Oracle, we prioritize your privacy. This Privacy Policy
              explains how we collect, use, and protect your data. We collect
              minimal data and do not store user inputs or chats processed by
              our AI, Elara.
            </p>
          </section>
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">2. Data We Collect</h3>
            <p>
              Free Tier Users: We collect only your Clerk ID (a unique user
              identifier) to enable account access.
            </p>
            <p>
              Paid Tier Users: We collect your name, email, and payment details,
              which are processed by Stripe and not stored by us.
            </p>
            <p>
              AI Interactions (Elara): Chats and inputs processed by Elara are
              handled live and not stored in any database. See{" "}
              <a
                href="https://console.groq.com/docs/legal/customer-data-processing-addendum#2-scope-and-purposes-of-processing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                Groq&apos;s Data Processing Addendum, Section 2.3
              </a>{" "}
              for details.
            </p>
            <p>
              We do not use cookies or collect any other data unless explicitly
              stated.
            </p>
          </section>
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">
              3. How We Use Your Data
            </h3>
            <p>Clerk ID: Used solely for account authentication and access.</p>
            <p>
              Name and Email (Paid Tier): Used to manage your subscription and
              communicate with you.
            </p>
            <p>
              Payment Details: Processed securely by Stripe to complete
              transactions, not stored by us.
            </p>
          </section>
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">4. Data Sharing</h3>
            <p>Third Parties:</p>
            <ul className="list-disc list-inside mb-4">
              <li>
                Clerk: Manages authentication and stores your Clerk ID. See{" "}
                <a href="#" className="hover:underline">
                  Clerk&apos;s Privacy Policy
                </a>
                .
              </li>
              <li>
                Stripe: Processes payments for paid-tier users. See{" "}
                <a href="#" className="hover:underline">
                  Stripe&apos;s Privacy Policy
                </a>
                .
              </li>
            </ul>
            <p>Legal Requirements: We may share data if required by law.</p>
            <p>No other data is shared with third parties.</p>
          </section>
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">5. Your Rights</h3>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside mb-4">
              <li>Access or delete your Clerk ID.</li>
              <li>Access or correct your name and email (paid-tier users).</li>
              <li>Contact Stripe directly for payment-related requests.</li>
            </ul>
            <p>
              To exercise these rights, contact us at regirock8080@gmail.com.
              Since Elara chats are not stored, no additional rights apply to
              those interactions.
            </p>
          </section>
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">6. Data Security</h3>
            <p>
              We use secure protocols (e.g., HTTPS) and rely on Clerk and
              Stripe&apos;s robust security measures to protect your data. Elara
              inputs are processed live and not stored, ensuring no risk of data
              breaches for those interactions.
            </p>
          </section>
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">7. Data Retention</h3>
            <p>
              We retain your Clerk ID as long as your account is active. Upon
              account deletion, your Clerk ID is removed.
            </p>
            <p>
              Name and email (paid-tier users) are retained only for active
              subscriptions.
            </p>
            <p>Payment details are not stored by us.</p>
            <p>Elara chats and inputs are not retained after processing.</p>
          </section>
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">
              8. Cookies and Tracking
            </h3>
            <p>
              We do not use cookies or tracking technologies unless otherwise
              specified.
            </p>
          </section>
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">9. Contact Us</h3>
            <p>For questions or to exercise your rights, contact us at:</p>
            <p>Email: regirock8080@gmail.com</p>
            <p>Address: Not applicable</p>
          </section>
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">
              10. Changes to This Policy
            </h3>
            <p>
              We may update this policy to reflect changes in our practices or
              legal requirements. We will notify you of significant updates via
              email or a website notice.
            </p>
          </section>
        </div>
      </div>
    </footer>
  );
}
