import LegalPageLayout from "@/components/footer/legal-page-layout";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="January 2025">
      <h2>Introduction</h2>
      <p>
        Welcome to Spriggle. We are committed to protecting your privacy and
        ensuring you have a positive experience on our platform. This Privacy
        Policy explains how we collect, use, disclose, and safeguard your
        information when you use our audiobook streaming service.
      </p>
      <p>
        By using Spriggle, you agree to the collection and use of information
        in accordance with this policy.
      </p>

      <h2>Information We Collect</h2>

      <h3>Account Information</h3>
      <p>When you create an account, we collect:</p>
      <ul>
        <li>Email address</li>
        <li>Password (stored in encrypted form)</li>
        <li>Name (optional)</li>
      </ul>

      <h3>Usage Data</h3>
      <p>We automatically collect information about how you use our service:</p>
      <ul>
        <li>Books you listen to and your listening history</li>
        <li>Bookmarks and playback positions</li>
        <li>Preferences and settings</li>
        <li>Search queries</li>
      </ul>

      <h3>Device Information</h3>
      <p>We collect information about the devices you use:</p>
      <ul>
        <li>Browser type and version</li>
        <li>Operating system</li>
        <li>Device type (mobile, tablet, desktop)</li>
        <li>IP address</li>
      </ul>

      <h3>Payment Information</h3>
      <p>
        If you subscribe to a paid plan, payment information is processed by our
        third-party payment processor. We do not store full credit card numbers
        on our servers.
      </p>

      <h2>How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide and maintain our service</li>
        <li>Remember your preferences and playback positions</li>
        <li>Personalize your experience and recommendations</li>
        <li>Process transactions and send related information</li>
        <li>Send you technical notices and support messages</li>
        <li>Respond to your comments and questions</li>
        <li>Analyze usage patterns to improve our service</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>Information Sharing</h2>
      <p>
        We do not sell your personal information. We may share your information
        in the following circumstances:
      </p>

      <h3>With Publishers</h3>
      <p>
        We share aggregated, anonymized usage data with publishers through our
        partner Cashmere Publishing. This helps publishers understand how their
        content is being consumed but does not include personally identifiable
        information.
      </p>

      <h3>Service Providers</h3>
      <p>
        We work with third-party companies to help us operate our service,
        including hosting and cloud infrastructure providers, payment processors,
        and analytics services.
      </p>

      <h3>Legal Requirements</h3>
      <p>
        We may disclose your information if required to do so by law or in
        response to valid requests by public authorities.
      </p>

      <h2>Children's Privacy (COPPA)</h2>
      <p>
        While Spriggle offers content suitable for children, our service is
        designed for use by parents or guardians with their children. We do not
        knowingly collect personal information directly from children under 13.
      </p>
      <p>
        If you believe we have inadvertently collected information from a child
        under 13 without parental consent, please contact us immediately.
      </p>

      <h2>Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access the personal information we hold about you</li>
        <li>Request correction of inaccurate information</li>
        <li>Request deletion of your information</li>
        <li>Opt-out of marketing communications</li>
        <li>Export your data in a portable format</li>
      </ul>
      <p>
        To exercise these rights, please contact us at{" "}
        <a href="mailto:privacy@spriggle.com">privacy@spriggle.com</a>.
      </p>

      <h2>Data Security</h2>
      <p>
        We implement appropriate security measures to protect your information,
        including encryption of data in transit and at rest, secure password
        hashing, and regular security audits.
      </p>

      <h2>Data Retention</h2>
      <p>
        We retain your information for as long as your account is active or as
        needed to provide you services. You can request deletion of your account
        and associated data at any time.
      </p>

      <h2>International Users</h2>
      <p>
        Your information may be transferred to and processed in the United
        States. If you are located in the European Union or other regions with
        data protection laws, you have additional rights under GDPR.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you
        of any changes by posting the new policy on this page and updating the
        "Last updated" date.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy, please contact us at{" "}
        <a href="mailto:privacy@spriggle.com">privacy@spriggle.com</a>.
      </p>
    </LegalPageLayout>
  );
}
