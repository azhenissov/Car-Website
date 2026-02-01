/**
 * Email Service Module
 * 
 * This module provides production-ready email functionality using Nodemailer
 * integrated with SendGrid SMTP service.
 * 
 * Why use environment variables?
 * - Security: API keys and credentials should never be hardcoded or committed to version control
 * - Flexibility: Different configurations for development, staging, and production environments
 * - Best Practices: Industry-standard approach for managing sensitive configuration
 * - Easy Deployment: Change configuration without modifying code
 */

const nodemailer = require('nodemailer');

/**
 * Logger utility for email operations
 * In production, you might want to use a more robust logging solution like Winston
 */
const logger = {
  info: (message, meta = {}) => {
    console.log(`[EMAIL SERVICE INFO] ${new Date().toISOString()} - ${message}`, meta);
  },
  error: (message, error = null) => {
    console.error(`[EMAIL SERVICE ERROR] ${new Date().toISOString()} - ${message}`, error);
  },
  warn: (message, meta = {}) => {
    console.warn(`[EMAIL SERVICE WARN] ${new Date().toISOString()} - ${message}`, meta);
  }
};

/**
 * Create and configure the email transporter
 * Uses SMTP settings from environment variables
 * 
 * Supported services:
 * - SendGrid: smtp.sendgrid.net (Port 587)
 * - Mailgun: smtp.mailgun.org (Port 587)
 * - Postmark: smtp.postmarkapp.com (Port 587)
 */
const createTransporter = () => {
  // Validate required environment variables
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logger.warn(`Missing email configuration: ${missingVars.join(', ')}. Email functionality may not work.`);
  }

  const transportConfig = {
    host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'apikey',
      pass: process.env.SMTP_PASS || '',
    },
    // Connection pool for better performance
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    // Timeout settings
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 30000,
  };

  return nodemailer.createTransport(transportConfig);
};

// Create transporter instance
const transporter = createTransporter();

/**
 * Verify email transporter connection
 * Call this on server startup to ensure email service is working
 */
const verifyConnection = async () => {
  try {
    await transporter.verify();
    logger.info('Email service connection verified successfully');
    return true;
  } catch (error) {
    logger.error('Email service connection failed', error);
    return false;
  }
};

/**
 * Get sender information from environment variables
 */
const getSender = () => {
  const name = process.env.EMAIL_FROM_NAME || 'AutoPrime';
  const email = process.env.EMAIL_FROM || 'noreply@autoprime.com';
  return `"${name}" <${email}>`;
};

/**
 * Base email sending function
 * All other email functions should use this
 * 
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content of the email
 * @param {string} [options.text] - Plain text version (optional, generated from HTML if not provided)
 * @returns {Promise<Object>} - Result of the email send operation
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: getSender(),
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for plain text version
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}`, { messageId: result.messageId });
    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    logger.error(`Failed to send email to ${to}`, error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

/**
 * Send welcome email to new users
 * 
 * @param {string} email - User's email address
 * @param {string} username - User's username
 * @param {string} firstName - User's first name (optional)
 */
const sendWelcomeEmail = async (email, username, firstName = '') => {
  const displayName = firstName || username;
  
  const subject = 'Welcome to AutoPrime - Your Premium Car Marketplace';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
          <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">AutoPrime</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Premium Car Marketplace</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 30px;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Welcome, ${displayName}!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for joining AutoPrime! We're excited to have you as part of our community of car enthusiasts.
            </p>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              With your new account, you can:
            </p>
            <ul style="color: #666; font-size: 16px; line-height: 2; margin: 0 0 30px 0; padding-left: 20px;">
              <li>Browse thousands of premium vehicles</li>
              <li>List your car for sale</li>
              <li>Connect with verified buyers and sellers</li>
              <li>Save your favorite listings</li>
            </ul>
            <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" 
                     style="display: inline-block; padding: 15px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                    Start Exploring
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 14px; margin: 0 0 10px 0;">
              Need help? Contact us at support@autoprime.com
            </p>
            <p style="color: #bbb; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} AutoPrime. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

/**
 * Send email verification link
 * 
 * @param {string} email - User's email address
 * @param {string} username - User's username
 * @param {string} verificationLink - Verification URL with token
 */
const sendVerificationEmail = async (email, username, verificationLink) => {
  const subject = 'Verify Your Email - AutoPrime';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
          <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">AutoPrime</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Email Verification</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 30px;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Hello, ${username}!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Please verify your email address to activate your AutoPrime account.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin: 30px auto;">
              <tr>
                <td style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); border-radius: 8px;">
                  <a href="${verificationLink}" 
                     style="display: inline-block; padding: 15px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                    Verify Email Address
                  </a>
                </td>
              </tr>
            </table>
            <p style="color: #999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
              Or copy and paste this link into your browser:<br>
              <a href="${verificationLink}" style="color: #667eea; word-break: break-all;">${verificationLink}</a>
            </p>
            <p style="color: #999; font-size: 14px; margin: 20px 0 0 0;">
              This link expires in 24 hours. If you didn't create an account, please ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #bbb; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} AutoPrime. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

/**
 * Send password reset email
 * 
 * @param {string} email - User's email address
 * @param {string} resetLink - Password reset URL with token
 */
const sendPasswordResetEmail = async (email, resetLink) => {
  const subject = 'Reset Your Password - AutoPrime';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
          <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">AutoPrime</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Password Reset</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 30px;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Password Reset Request</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              We received a request to reset your password. Click the button below to create a new password.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin: 30px auto;">
              <tr>
                <td style="background: linear-gradient(135deg, #dc3545 0%, #e91e63 100%); border-radius: 8px;">
                  <a href="${resetLink}" 
                     style="display: inline-block; padding: 15px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                    Reset Password
                  </a>
                </td>
              </tr>
            </table>
            <p style="color: #999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
              Or copy and paste this link into your browser:<br>
              <a href="${resetLink}" style="color: #667eea; word-break: break-all;">${resetLink}</a>
            </p>
            <div style="background-color: #fff3cd; border: 1px solid #ffeeba; border-radius: 8px; padding: 15px; margin-top: 30px;">
              <p style="color: #856404; font-size: 14px; margin: 0;">
                <strong>Important:</strong> This link expires in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #bbb; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} AutoPrime. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

/**
 * Send notification email for car listing updates
 * 
 * @param {string} email - User's email address
 * @param {Object} options - Notification options
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} [options.actionUrl] - Optional action URL
 * @param {string} [options.actionText] - Optional action button text
 */
const sendNotificationEmail = async (email, { title, message, actionUrl, actionText }) => {
  const subject = `${title} - AutoPrime`;
  
  const actionButton = actionUrl && actionText ? `
    <table cellpadding="0" cellspacing="0" style="margin: 30px auto;">
      <tr>
        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
          <a href="${actionUrl}" 
             style="display: inline-block; padding: 15px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
            ${actionText}
          </a>
        </td>
      </tr>
    </table>
  ` : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
          <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">AutoPrime</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Notification</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 30px;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">${title}</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              ${message}
            </p>
            ${actionButton}
          </td>
        </tr>
        <tr>
          <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 14px; margin: 0 0 10px 0;">
              You received this email because you have an account with AutoPrime.
            </p>
            <p style="color: #bbb; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} AutoPrime. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

/**
 * Send car listing confirmation email
 * 
 * @param {string} email - Seller's email address
 * @param {Object} car - Car listing details
 */
const sendListingConfirmationEmail = async (email, car) => {
  const subject = 'Your Car Listing is Live! - AutoPrime';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
          <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">AutoPrime</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Listing Confirmed</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 30px;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Your Listing is Now Live!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Great news! Your car listing has been successfully published on AutoPrime.
            </p>
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">${car.title || `${car.year} ${car.brand} ${car.model}`}</h3>
              <table width="100%" cellpadding="5" cellspacing="0">
                <tr>
                  <td style="color: #666; width: 100px;">Price:</td>
                  <td style="color: #333; font-weight: 600;">$${car.price?.toLocaleString() || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="color: #666;">Year:</td>
                  <td style="color: #333;">${car.year || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="color: #666;">Mileage:</td>
                  <td style="color: #333;">${car.mileage?.toLocaleString() || 'N/A'} km</td>
                </tr>
              </table>
            </div>
            <table cellpadding="0" cellspacing="0" style="margin: 30px auto;">
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}#cars" 
                     style="display: inline-block; padding: 15px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                    View Your Listing
                  </a>
                </td>
              </tr>
            </table>
            <p style="color: #999; font-size: 14px; margin: 20px 0 0 0;">
              Tip: Share your listing on social media to attract more buyers!
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #bbb; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} AutoPrime. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

// Export all email functions
module.exports = {
  verifyConnection,
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendNotificationEmail,
  sendListingConfirmationEmail,
};
