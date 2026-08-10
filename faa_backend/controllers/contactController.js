const sendEmail = require('../utils/sendEmail');

const submitContactForm = async (req, res) => {
  const { name, phone, address, description } = req.body;

  if (!name || !phone || !address || !description) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  try {
    // Send email to admin
    const emailOptions = {
      email: process.env.SMTP_EMAIL || 'faabusinessgroup@gmail.com',
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #219653;">New Contact Form Submission</h2>
          <p>You have received a new message from the contact form on your website.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 120px;">Name</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Phone</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Address</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${address}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Description</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${description}</td>
            </tr>
          </table>
        </div>
      `,
    };

    await sendEmail(emailOptions);

    res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

module.exports = { submitContactForm };
