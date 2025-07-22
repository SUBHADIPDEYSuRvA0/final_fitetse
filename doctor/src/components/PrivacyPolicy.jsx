import  "./legal-pages.css"
import FooterSection from "./FooterSection"

const PrivacyPolicy = () => {
  return (
    <div>
      <div className="legal-header">
        <div className="container">
          <a href="/" className="back-link">
            <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </a>
          <h1>Privacy Policy</h1>
          {/* <p>Last updated: {new Date().toLocaleDateString()}</p> */}
        </div>
      </div>

      <div className="container">
        <div className="legal-content">
          <div className="section">
            <h2 className="section-title">1. Information We Collect</h2>
            <div className="section-content">
              <p>We collect information you provide directly to us, such as:</p>
              <ul>
                <li>Name and contact information</li>
                <li>Account credentials</li>
                <li>Payment information</li>
                <li>Communications with us</li>
              </ul>
              <p>
                We also automatically collect certain information when you use our services, including device
                information, usage data, and cookies.
              </p>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">2. How We Use Your Information</h2>
            <div className="section-content">
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide and maintain our services</li>
                <li>Process transactions and send notifications</li>
                <li>Respond to your comments and questions</li>
                <li>Improve our services and develop new features</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">3. Information Sharing</h2>
            <div className="section-content">
              <p>We may share your information in the following circumstances:</p>
              <ul>
                <li>With service providers who assist in our operations</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transaction</li>
                <li>With your consent</li>
              </ul>
              <p>We do not sell your personal information to third parties.</p>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">4. Data Security</h2>
            <div className="section-content">
              <p>
                We implement appropriate security measures to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction. However, no method of transmission over the internet is
                100% secure.
              </p>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">5. Your Rights</h2>
            <div className="section-content">
              <p>You have the right to:</p>
              <ul>
                <li>Access and update your personal information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request data portability</li>
              </ul>
            </div>
          </div>

          {/* <div className="section">
            <h2 className="section-title">6. Contact Us</h2>
            <div className="section-content">
              <p>If you have any questions about this Privacy Policy, please contact us:</p>
              <div className="contact-info">
                <p>
                  <strong>Email:</strong> privacy@yourcompany.com
                </p>
                <p>
                  <strong>Address:</strong> Your Company Address
                </p>
                <p>
                  <strong>Phone:</strong> Your Phone Number
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      <div className="legal-footer">
        <div className="container">
          <p>&copy; 2025 Fitetse. All rights reserved.</p>
        </div>
      </div>
      <FooterSection></FooterSection>
    </div>
  )
}

export default PrivacyPolicy
