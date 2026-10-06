const axios = require('axios');
require('dotenv').config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = process.env.BREVO_API_URL || 'https://api.brevo.com/v3/smtp/email';
const SENDER_NAME = process.env.SENDER_NAME || 'Job Portal Admin';
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'arvofficial5360@gmail.com';

/**
 * Send OTP email to admin using Brevo API
 * @param {string} recipientEmail - Email address to send OTP to
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<boolean>} - Returns true if email sent successfully
 */
async function sendOTPEmail(recipientEmail, otp) {
    try {
        if (!BREVO_API_KEY) {
            console.error('❌ BREVO_API_KEY is not configured in .env file');
            return false;
        }

        const payload = {
            sender: {
                name: SENDER_NAME,
                email: SENDER_EMAIL
            },
            to: [{
                email: recipientEmail,
                name: 'Admin'
            }],
            subject: `Your Admin Login OTP - ${otp}`,
            htmlContent: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 50px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                        .header h1 { margin: 0; font-size: 24px; }
                        .content { padding: 40px 30px; text-align: center; }
                        .otp-box { background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; margin: 30px 0; }
                        .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
                        .message { color: #555; font-size: 16px; line-height: 1.6; margin: 20px 0; }
                        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; text-align: left; }
                        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #888; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Admin Login Verification</h1>
                        </div>
                        <div class="content">
                            <p class="message">
                                Hello Admin,<br><br>
                                You have requested to login to the admin panel. 
                                Please use the following One-Time Password (OTP) to complete your login:
                            </p>
                            <div class="otp-box">
                                <div class="otp-code">${otp}</div>
                            </div>
                            <p class="message">
                                This OTP is valid for <strong>10 minutes</strong>.
                            </p>
                            <div class="warning">
                                <strong>⚠️ Security Notice:</strong><br>
                                • Never share this OTP with anyone<br>
                                • Our team will never ask for your OTP<br>
                                • If you didn't request this, please ignore this email
                            </div>
                        </div>
                        <div class="footer">
                            <p>This is an automated message, please do not reply.</p>
                            <p>&copy; ${new Date().getFullYear()} Job Portal. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const headers = {
            accept: 'application/json',
            'api-key': BREVO_API_KEY,
            'Content-Type': 'application/json'
        };

        const response = await axios.post(BREVO_API_URL, payload, { headers });

        console.log(`✅ OTP email sent successfully to ${recipientEmail}`);
        return true;
    } catch (error) {
        console.error('❌ Failed to send OTP email:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        return false;
    }
}

module.exports = {
    sendOTPEmail
};
