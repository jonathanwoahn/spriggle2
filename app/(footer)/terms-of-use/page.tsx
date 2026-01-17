import LegalPageLayout from "@/components/footer/legal-page-layout";

export default function TermsOfUsePage() {
  return (
    <LegalPageLayout title="Terms of Use" lastUpdated="January 2025">
      <h2>Acceptance of Terms</h2>
      <p>
        By accessing or using Spriggle, you agree to be bound by these Terms of
        Use. If you do not agree to these terms, please do not use our service.
      </p>

      <h2>Description of Service</h2>
      <p>
        Spriggle is an AI-powered audiobook streaming platform that provides
        access to classic literature through AI-generated narration. Our content
        is sourced from licensed publishers through our partnership with
        Cashmere Publishing.
      </p>

      <h2>Account Registration</h2>
      <p>
        You must be at least 13 years old to create an account. If you are under
        18, you represent that you have your parent or guardian's permission to
        use the service. You are responsible for maintaining the confidentiality
        of your account credentials.
      </p>

      <h2>Subscription and Billing</h2>
      <p>
        Spriggle offers both free and paid subscription options. Paid
        subscriptions automatically renew unless cancelled before the renewal
        date. You may cancel your subscription at any time through your account
        settings.
      </p>

      <h2>Content and Intellectual Property</h2>
      <p>
        All content on Spriggle, including audiobooks, text, graphics, and
        AI-generated narration, is protected by copyright and other intellectual
        property laws. Content is licensed, not sold, to you for personal use.
        You may not copy, redistribute, or create derivative works from our
        content.
      </p>

      <h2>AI-Generated Content Disclaimer</h2>
      <p>
        Spriggle uses artificial intelligence to generate audiobook narration.
        You acknowledge that AI narration may differ from traditional human
        narration. Despite our quality controls, there may be occasional
        pronunciation or pacing variations.
      </p>

      <h2>Acceptable Use</h2>
      <p>You agree to use Spriggle only for lawful purposes and not to:</p>
      <ul>
        <li>Use the service for commercial purposes without consent</li>
        <li>Circumvent content protection or access controls</li>
        <li>Share account credentials outside authorized family sharing</li>
        <li>Record or redistribute content</li>
        <li>Interfere with or disrupt the service</li>
      </ul>

      <h2>Termination</h2>
      <p>
        We may suspend or terminate your account if you violate these terms. You
        may also terminate your account at any time by contacting us.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Spriggle shall not be liable for
        any indirect, incidental, special, or consequential damages. The service
        is provided "as is" without warranties of any kind.
      </p>

      <h2>Changes to Terms</h2>
      <p>
        We reserve the right to modify these terms at any time. Your continued
        use of Spriggle after changes constitutes acceptance of the new terms.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have questions about these Terms of Use, please contact us at{" "}
        <a href="mailto:legal@spriggle.com">legal@spriggle.com</a>.
      </p>
    </LegalPageLayout>
  );
}
