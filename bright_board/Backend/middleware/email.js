const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure nodemailer with environment variables
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Function to send OTP email
async function sendOtpEmail(email, otp) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Verification Code for BrightBoard',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4a5568; text-align: center;">BrightBoard Verification</h2>
          <p style="color: #4a5568; font-size: 16px;">Hello,</p>
          <p style="color: #4a5568; font-size: 16px;">Your verification code for BrightBoard is:</p>
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #4299e1; letter-spacing: 5px; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #4a5568; font-size: 16px;">This code will expire in 10 minutes.</p>
          <p style="color: #4a5568; font-size: 16px;">If you didn't request this code, please ignore this email.</p>
          <p style="color: #4a5568; font-size: 14px; margin-top: 30px; text-align: center;">© ${new Date().getFullYear()} BrightBoard. All rights reserved.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendOtpEmail
};