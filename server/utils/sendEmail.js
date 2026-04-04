const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let transporter;

  // Use Ethereal if real credentials are not provided
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    console.log("No SMTP credentials found... Creating Ethereal test account");
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Subscription System" <noreply@example.com>',
    to: options.to,
    subject: options.subject,
    html: options.html
  };

  const info = await transporter.sendMail(mailOptions);

  // Log ethereal URL if using ethereal
  if (info.messageId && nodemailer.getTestMessageUrl(info)) {
    console.log(`\n======================================================`);
    console.log(`📧 AUTOMATED EMAIL SENT SUCCESSFULLY!`);
    console.log(`📬 Preview your HTML Email here (Ctrl+Click):`);
    console.log(`🔗 ${nodemailer.getTestMessageUrl(info)}`);
    console.log(`======================================================\n`);
  }
};

module.exports = sendEmail;
