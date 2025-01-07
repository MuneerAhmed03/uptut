import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { logger } from './logger';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
  url: 'https://api.mailgun.net',
});

const DOMAIN = process.env.MAILGUN_DOMAIN || '';
const FROM_EMAIL = `Library System <noreply@${DOMAIN}>`;

export const sendVerificationEmail = async (to: string, token: string) => {
  try {
    const verificationLink = `${process.env.APP_URL}/verify-email?token=${token}`;

    const messageData = {
      from: FROM_EMAIL,
      to,
      subject: 'Verify Your Email - Library Management System',
      template: 'email-verification',
      'h:X-Mailgun-Variables': JSON.stringify({
        verification_link: verificationLink,
        app_name: 'Library Management System',
      }),
    };

    await mg.messages.create(DOMAIN, messageData);
    logger.info(`Verification email sent to ${to}`);
  } catch (error) {
    logger.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  try {
    const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;

    const messageData = {
      from: FROM_EMAIL,
      to,
      subject: 'Password Reset - Library Management System',
      template: 'password-reset',
      'h:X-Mailgun-Variables': JSON.stringify({
        reset_link: resetLink,
        app_name: 'Library Management System',
      }),
    };

    await mg.messages.create(DOMAIN, messageData);
    logger.info(`Password reset email sent to ${to}`);
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

export const sendBookDueReminderEmail = async (to: string, bookTitle: string, dueDate: Date) => {
  try {
    const messageData = {
      from: FROM_EMAIL,
      to,
      subject: 'Book Due Reminder - Library Management System',
      template: 'book-due-reminder',
      'h:X-Mailgun-Variables': JSON.stringify({
        book_title: bookTitle,
        due_date: dueDate.toLocaleDateString(),
        app_name: 'Library Management System',
      }),
    };

    await mg.messages.create(DOMAIN, messageData);
    logger.info(`Book due reminder email sent to ${to}`);
  } catch (error) {
    logger.error('Error sending book due reminder email:', error);
    throw new Error('Failed to send book due reminder email');
  }
}; 