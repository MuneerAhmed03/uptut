import nodemailer from 'nodemailer';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  try {
    const verificationLink = `${process.env.APP_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject: 'Verify Your Email - Library Management System',
      html: `
        <h1>Email Verification</h1>
        <p>Thank you for registering with our Library Management System.</p>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not request this verification, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${to}`);
  } catch (error) {
    logger.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  try {
    const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject: 'Password Reset - Library Management System',
      html: `
        <h1>Password Reset Request</h1>
        <p>You have requested to reset your password.</p>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this reset, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${to}`);
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

export const sendBookDueReminderEmail = async (to: string, bookTitle: string, dueDate: Date) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject: 'Book Due Reminder - Library Management System',
      html: `
        <h1>Book Due Reminder</h1>
        <p>This is a reminder that your book "${bookTitle}" is due on ${dueDate.toLocaleDateString()}.</p>
        <p>Please return the book to avoid any late fees.</p>
        <p>If you have already returned the book, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Book due reminder email sent to ${to}`);
  } catch (error) {
    logger.error('Error sending book due reminder email:', error);
    throw new Error('Failed to send book due reminder email');
  }
}; 