import nodemailer, { TransportOptions } from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Load SMTP configuration from environment variables
const HOSTNAME = process.env.HOSTNAME || `http://localhost:${process.env.PORT}`;

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

interface MailOptions extends TransportOptions {
  host: string | undefined;
  port: number;
  secure: boolean;
  auth: {
    user: string | undefined;
    pass: string | undefined;
  };
}

// Define SMTP transport options
const transportOptions: MailOptions = {
  host: smtpHost,
  port: smtpPort,
  secure: true, // true for 465, false for other ports
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
};

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport(transportOptions);

// Utility function to send an email
const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: smtpUser,
    to,
    subject,
    html,
  };

  try {
    const info:any = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email: ', error);
  }
};

// Function to send verification email
const sendVerificationEmail = async (user: { email: string; firstName: string }, verificationCode: string) => {
  const verificationLink = `${HOSTNAME}/auth/verify-email?email=${user.email}&code=${verificationCode}`;
  const templatePath = path.join(__dirname, 'templates/verification-email.html');
  let emailTemplate = fs.readFileSync(templatePath, 'utf8');

  // Replace placeholders with actual values
  emailTemplate = emailTemplate.replace('{{name}}', user.firstName);
  emailTemplate = emailTemplate.replace('{{verificationLink}}', verificationLink);

  await sendEmail(user.email, 'Verify Your Email', emailTemplate);
};

// Function to send password reset email
const sendPasswordResetEmail = async (user: { email: string; firstName: string }, resetCode: string) => {
  const resetLink = `${HOSTNAME}/auth/reset-password?email=${user.email}&code=${resetCode}`;
  const templatePath = path.join(__dirname, 'templates/reset-password-email.html');
  let emailTemplate = fs.readFileSync(templatePath, 'utf8');

  // Replace placeholders with actual values
  emailTemplate = emailTemplate.replace('{{name}}', user.firstName);
  emailTemplate = emailTemplate.replace('{{resetLink}}', resetLink);

  await sendEmail(user.email, 'Reset Your Password', emailTemplate);
};

export {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
