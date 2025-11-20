import Link from "next/link";

export default function TermsOfService() {
  return (
    <footer className="border-t border-gray-200/5">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-6">Terms of Service</h2>
        <p className="mb-8">Effective Date: October 19, 2025</p>
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">1. Introduction</h3>
            <p>
              Welcome to Depth Oracle. These Terms of Service
              (&quot;Terms&quot;) govern your use of our website, services, and
              AI assistant, Elara (collectively, the &quot;Service&quot;). By
              accessing or using the Service, you agree to be bound by these
              Terms. If you do not agree, please do not use the Service.
            </p>
          </section>
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">2. Eligibility</h3>
            <p>
              You must be at least 13 years old to use the Service. By using the
              Service, you represent that you meet this age requirement and have
              the legal capacity to enter into these Terms.
            </p>
          </section>
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">
              3. Account Responsibilities
            </h3>
            <p>
              To access certain features, you must connect your Cardano wallet.
              You are responsible for:
            </p>
            <ul className="list-disc list-inside mb-4">
              <li>
                Maintaining the security of your wallet and private keys.
              </li>
              <li>All activities conducted under your wallet address.</li>
              <li>Not sharing your wallet access with others.</li>
            </ul>
            <p>
              Depth Oracle reserves the right to suspend or terminate access
              for misuse or violation of these Terms.
            </p>
          </section>
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">
              4. Use of the Service
            </h3>
            <p>
              You agree to use the Service only for lawful purposes and in
              accordance with these Terms. You may not:
            </p>
            <ul className="list-disc list-inside mb-4">
              <li>
                Use Elara to generate harmful, illegal, or offensive content.
              </li>
              <li>
                Attempt to reverse-engineer, hack, or interfere with the
                Service.
              </li>
              <li>
                Use the Service to violate any third-party rights, including
                intellectual property rights.
              </li>
              <li>Overload or disrupt the Service’s infrastructure.</li>
            </ul>
            <p>
              Elara’s responses are generated in real-time and are provided
              “as-is” for informational purposes only.
            </p>
          </section>
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">
              5. Subscriptions and Payments
            </h3>
            <p>
              Depth Oracle offers free and paid tiers. Paid tier subscriptions
              are managed through Stripe. For pricing and subscription details,
              visit{" "}
              <a href="https://x.ai/grok" className="hover:underline">
                x.ai/grok
              </a>
              .
            </p>
            <p>
              You agree to provide accurate payment information and authorize
              Stripe to charge applicable fees. Subscriptions may auto-renew
              unless canceled. Depth Oracle does not store payment details;
              these are handled securely by Stripe.
            </p>
          </section>
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">
              6. Intellectual Property
            </h3>
            <p>
              The Service, including Elara and all related content, is owned by
              Depth Oracle or its licensors and protected by intellectual
              property laws. You may not copy, modify, or distribute any part of
              the Service without permission.
            </p>
            <p>
              Content you provide to Elara remains yours, but you grant Depth
              Oracle a non-exclusive, royalty-free license to process it for the
              purpose of providing AI responses.
            </p>
          </section>
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">7. Termination</h3>
            <p>
              You may stop using the Service at any time. Depth Oracle may
              suspend or terminate your access if you violate these Terms,
              misuse the Service, or for any other reason at our discretion.
              Upon termination, your account data will be handled per our{" "}
              <a href="#" className="hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </section>
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">
              8. Limitation of Liability
            </h3>
            <p>
              The Service is provided “as-is” without warranties of any kind.
              Depth Oracle is not liable for any damages arising from your use
              of the Service, including but not limited to errors in Elara’s
              responses or service interruptions.
            </p>
            <p>
              To the maximum extent permitted by law, our total liability is
              limited to the amount you paid for the Service in the past 12
              months.
            </p>
          </section>
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">9. Governing Law</h3>
            <p>
              These Terms are governed by the laws of [Your Jurisdiction, e.g.,
              California, USA]. Any disputes will be resolved in the courts of
              [Your Jurisdiction].
            </p>
          </section>
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">
              10. Changes to These Terms
            </h3>
            <p>
              We may update these Terms to reflect changes in our Service or
              legal requirements. We will notify you of significant changes via
              email or a website notice. Your continued use of the Service after
              changes constitutes acceptance of the updated Terms.
            </p>
          </section>
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">11. Contact Us</h3>
            <p>For questions about these Terms, contact us at:</p>
            <p>
              Email:{" "}
              <Link
                href="mailto:regirock8080@gmail.com"
                className="hover:underline"
              >
                regirock8080@gmail.com
              </Link>
            </p>
          </section>
        </div>
      </div>
    </footer>
  );
}
