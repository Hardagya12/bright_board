const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to send OTP email
async function sendOtpEmail(email, otp) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'BrightBoard - Email Verification OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #4f46e5; text-align: center;">BrightBoard</h2>
                    <h3 style="text-align: center;">Email Verification</h3>
                    <p>Thank you for registering with BrightBoard. Please use the following OTP to verify your email address:</p>
                    <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This OTP is valid for 10 minutes. If you did not request this verification, please ignore this email.</p>
                    <p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 30px;">
                        &copy; ${new Date().getFullYear()} BrightBoard. All rights reserved.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
}

module.exports = { sendOtpEmail };