const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls:{
    rejectUnauthorized:false
  }
  // isko deployment pe hata dena hai (less secure app access)
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Bright Board - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Email Verification</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Thank you for registering with Bright Board. Please use the following OTP to verify your email address:
          </p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center; margin: 30px 0;">
            <h1 style="color: #4F46E5; font-size: 36px; margin: 0; letter-spacing: 8px;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            This OTP is valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes. Please do not share this code with anyone.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">
            If you didn't request this verification, please ignore this email.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send verification email');
  }
};

const sendPasswordResetOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Bright Board - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            You have requested to reset your password. Please use the following OTP to proceed:
          </p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center; margin: 30px 0;">
            <h1 style="color: #4F46E5; font-size: 36px; margin: 0; letter-spacing: 8px;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            This OTP is valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes. Please do not share this code with anyone.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">
            If you didn't request this password reset, please ignore this email and your password will remain unchanged.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetOTP
};
