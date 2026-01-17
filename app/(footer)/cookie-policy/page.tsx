import LegalPageLayout from "@/components/footer/legal-page-layout";

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="January 2025">
      <h2>What Are Cookies</h2>
      <p>
        Cookies are small text files that are placed on your device when you
        visit a website. They help the website remember information about your
        visit, like your preferences and settings, making your next visit
        easier and the site more useful to you.
      </p>

      <h2>Cookies We Use</h2>
      <p>
        Spriggle uses the following types of cookies to provide you with the
        best possible experience:
      </p>

      <h3>Essential Cookies</h3>
      <p>
        These cookies are necessary for the website to function properly. They
        enable core functionality such as security, authentication, and
        accessibility. You cannot opt out of these cookies as the service would
        not work without them.
      </p>
      <ul>
        <li>
          <strong>Session cookies</strong> - Keep you logged in as you navigate
          between pages
        </li>
        <li>
          <strong>Security cookies</strong> - Help protect your account from
          unauthorized access
        </li>
      </ul>

      <h3>Functional Cookies</h3>
      <p>
        These cookies remember your preferences and settings to enhance your
        experience:
      </p>
      <ul>
        <li>
          <strong>Playback position</strong> - Remember where you stopped
          listening in a book
        </li>
        <li>
          <strong>Preferences</strong> - Remember your volume settings and
          playback speed
        </li>
        <li>
          <strong>Theme preference</strong> - Remember your display preferences
        </li>
      </ul>

      <h3>Analytics Cookies</h3>
      <p>
        These cookies help us understand how visitors interact with our
        website. The information is collected anonymously and used to improve
        our services:
      </p>
      <ul>
        <li>Pages visited and time spent on each page</li>
        <li>Technical information about your browser and device</li>
        <li>How you found our website</li>
      </ul>

      <h2>Third-Party Cookies</h2>
      <p>
        We may use third-party services that set their own cookies, such as:
      </p>
      <ul>
        <li>
          <strong>Analytics providers</strong> - To help us understand how our
          service is used
        </li>
        <li>
          <strong>Payment processors</strong> - To securely handle transactions
        </li>
      </ul>
      <p>
        We do not use advertising cookies or sell your data to third parties
        for advertising purposes.
      </p>

      <h2>Managing Cookies</h2>
      <p>
        You can control and manage cookies in various ways. Please note that
        removing or blocking cookies may impact your user experience and some
        features may not work as intended.
      </p>
      <h3>Browser Settings</h3>
      <p>
        Most web browsers allow you to manage cookies through their settings.
        You can typically find these in the "Options" or "Preferences" menu of
        your browser. The following links provide instructions for popular
        browsers:
      </p>
      <ul>
        <li>Chrome - Settings → Privacy and security → Cookies</li>
        <li>Firefox - Settings → Privacy & Security → Cookies</li>
        <li>Safari - Preferences → Privacy → Cookies</li>
        <li>Edge - Settings → Cookies and site permissions</li>
      </ul>

      <h2>Updates to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time to reflect changes
        in our practices or for other operational, legal, or regulatory
        reasons. We encourage you to review this policy periodically.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have any questions about our use of cookies, please contact us
        at{" "}
        <a href="mailto:privacy@spriggle.com">privacy@spriggle.com</a>.
      </p>
    </LegalPageLayout>
  );
}
