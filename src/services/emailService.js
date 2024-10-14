/**
 * @file src/services/emailService.js
 * @description Email service for sending emails.
 */

const nodemailer = require("nodemailer");

/**
 * @function sendEmail - Send an email with the specified options.
 * @param {Object} options - The email options.
 * @param {string} options.from - The email address to send the email from.
 * @param {string} options.to - The email address to send the email to.
 * @param {string} options.subject - The subject of the email.
 * @param {string} options.text - The text content of the email.
 * @param {string} options.html - The HTML content of the email.
 * @returns {Promise} - A promise that resolves when the email is sent.
 * @throws {Error} - Throws an error if the email fails to send.
 */
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: options.from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
};

/**
 * @function sendEmailVerification - Send an email verification email. (with JWT token)
 * @param {string} email - The email address to send the verification email to.
 * @param {string} token - The JWT token to include in the verification URL.
 * @param {string} callbackUrl - The URL to redirect to after verification.
 */
const sendEmailVerification = async (email, token, callbackUrl) => {
  const verificationUrl = `${callbackUrl}?token=${token}`;

  try {
    await sendEmail({
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: "Verify your email | MPC-Lab",
      text: `Please click the following link to verify your email: ${verificationUrl}`,
      html: `<p>Please click the following link to verify your email: <a href="${encodeURI(
        verificationUrl
      )}">${encodeURI(verificationUrl)}</a></p>`,
    });
  } catch (error) {
    throw error;
  }
};

module.exports = { sendEmail, sendEmailVerification };
