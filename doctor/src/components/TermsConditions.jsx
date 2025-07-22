import React from 'react'
import  "./legal-pages.css"
import FooterSection from './FooterSection'





const TermsConditions = () => {
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
          <h1>Terms & Conditions</h1>
          {/* <p>Last updated: {new Date().toLocaleDateString()}</p> */}
        </div>
      </div>

      <div className="container">
        <div className="legal-content">
          <div className="section">
            <h2 className="section-title">1. Acceptance of Terms</h2>
            <div className="section-content">
              <p>
                By accessing and using this service, you accept and agree to be bound by the terms and provision of this
                agreement. If you do not agree to these terms, please do not use this service.
              </p>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">2. Use of Service</h2>
            <div className="section-content">
              <p>You may use our service for lawful purposes only. You agree not to:</p>
              <ul>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful or malicious content</li>
                <li>Interfere with the service's operation</li>
                <li>Attempt unauthorized access to our systems</li>
              </ul>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">3. User Accounts</h2>
            <div className="section-content">
              <p>When you create an account, you must provide accurate information. You are responsible for:</p>
              <ul>
                <li>Maintaining the confidentiality of your account</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us of any unauthorized use</li>
              </ul>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">4. Payment Terms</h2>
            <div className="section-content">
              <p>If you purchase services from us:</p>
              <ul>
                <li>All fees are non-refundable unless otherwise stated</li>
                <li>You must provide current and accurate billing information</li>
                <li>We may change our fees at any time with notice</li>
                <li>You authorize us to charge your payment method</li>
              </ul>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">5. Intellectual Property</h2>
            <div className="section-content">
              <p>
                The service and its original content, features, and functionality are owned by us and are protected by
                international copyright, trademark, and other intellectual property laws.
              </p>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">6. Limitation of Liability</h2>
            <div className="section-content">
              <p>
                In no event shall we be liable for any indirect, incidental, special, consequential, or punitive
                damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">7. Termination</h2>
            <div className="section-content">
              <p>
                We may terminate or suspend your account and access to the service immediately, without prior notice,
                for conduct that we believe violates these terms or is harmful to other users or us.
              </p>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">8. Changes to Terms</h2>
            <div className="section-content">
              <p>
                We reserve the right to modify these terms at any time. We will notify you of any changes by posting the
                new terms on this page. Your continued use of the service after such modifications constitutes
                acceptance of the updated terms.
              </p>
            </div>
          </div>

          {/* <div className="section">
            <h2 className="section-title">9. Contact Information</h2>
            <div className="section-content">
              <p>If you have any questions about these Terms & Conditions, please contact us:</p>
              <div className="contact-info">
                <p>
                  <strong>Email:</strong> legal@yourcompany.com
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

export default TermsConditions
