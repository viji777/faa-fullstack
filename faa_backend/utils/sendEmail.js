const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter using SMTP
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.SMTP_EMAIL}`,
    to: options.email,
    subject: options.subject,
    html: options.html, // Using HTML instead of plain text for better look
  };

  try {
    await transporter.sendMail(message);
    console.log(`Email sent successfully to ${options.email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
