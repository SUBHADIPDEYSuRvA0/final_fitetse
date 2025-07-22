const nodemailer = require('nodemailer');

// Create transporter with error handling
let transporter;

try {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Add timeout and connection settings
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
} catch (error) {
  console.warn('Email transporter creation failed:', error.message);
  transporter = null;
}

async function sendEmail({ to, subject, html }) {
  // If no email configuration or transporter failed, log and return success
  if (!transporter || !process.env.SMTP_HOST) {
    console.log('📧 Email would be sent (email not configured):', {
      to,
      subject,
      html: html.substring(0, 100) + '...'
    });
    return { success: true, message: 'Email logged (no SMTP configured)' };
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@fittese.com',
    to,
    subject,
    html,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', { to, subject });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('📧 Email sending failed:', error.message);
    
    // Log the email content for debugging
    console.log('📧 Failed email details:', {
      to,
      subject,
      html: html.substring(0, 200) + '...'
    });
    
    // Return error but don't crash the application
    return { 
      success: false, 
      error: error.message,
      message: 'Email service temporarily unavailable'
    };
  }
}

module.exports = sendEmail; 