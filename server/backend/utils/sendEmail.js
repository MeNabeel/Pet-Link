const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let transporter;

  // Check if real SMTP parameters exist in the env environment
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS.replace(/\s+/g, ''),
      },
    });
  } else {
    // Generate a test Ethereal SMTP account dynamically for instant visual testing
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('📬 Created dynamic Ethereal Mail testing account...');
    } catch (err) {
      // Direct console logging fallback if Ethereal API is offline
      console.log('\n==================================================');
      console.log('✉️  MOCK EMAIL LOG (NO SMTP CREDENTIALS IN .ENV)');
      console.log(`To:      ${options.email}`);
      console.log(`Subject: ${options.subject}`);
      console.log('--------------------------------------------------');
      console.log(options.message || options.html);
      console.log('==================================================\n');
      return;
    }
  }

  try {
    const mailOptions = {
      from: `"PetLink Security" <${process.env.SMTP_FROM || 'noreply@petlink.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email dispatched: ${info.messageId}`);
    
    // Log the Ethereal click-link visual email preview!
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`\n📬 Click link to view password reset email preview:`);
      console.log(`${previewUrl}\n`);
    }
  } catch (error) {
    console.error(`Nodemailer delivery failure: ${error.message}`);
    throw new Error('Email could not be delivered.');
  }
};

module.exports = sendEmail;
