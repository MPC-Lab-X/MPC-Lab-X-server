/**
 * @file tests/services/emailService.test.js
 * @description Tests for the email service functions.
 */

const { sendEmail } = require("../../src/services/emailService");
const nodemailer = require("nodemailer");

jest.mock("nodemailer");

const sendMailMock = jest.fn();
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

describe("sendEmail", () => {
  beforeEach(() => {
    sendMailMock.mockClear();
  });

  it("should send an email with the specified options", async () => {
    sendMailMock.mockResolvedValue(true);

    const options = {
      from: "test@example.com",
      to: "recipient@example.com",
      subject: "Test Subject",
      text: "Test text content",
      html: "<p>Test HTML content</p>",
    };

    await sendEmail(options);

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    expect(sendMailMock).toHaveBeenCalledWith({
      from: options.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  });

  it("should throw an error if sending email fails", async () => {
    sendMailMock.mockRejectedValue(new Error("Failed to send email"));

    const options = {
      from: "test@example.com",
      to: "recipient@example.com",
      subject: "Test Subject",
      text: "Test text content",
      html: "<p>Test HTML content</p>",
    };

    await expect(sendEmail(options)).rejects.toThrow("Failed to send email");
  });
});
