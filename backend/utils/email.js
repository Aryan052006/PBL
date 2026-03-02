const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // For local development, you might want to use a service like Ethereal
    // or log to the console if no SMTP is provided.
    // For PBL, we'll try to use a generic transporter that can be configured in .env

    // Create a transporter
    const isGmail = process.env.SMTP_HOST === 'smtp.gmail.com';

    const transporter = nodemailer.createTransport({
        service: isGmail ? 'gmail' : undefined,
        host: isGmail ? undefined : (process.env.SMTP_HOST || 'smtp.ethereal.email'),
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // Define email options
    const mailOptions = {
        from: `CareerForge <${process.env.SMTP_FROM || 'noreply@careerforge.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    // Send the email
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${options.email}`);
    } catch (error) {
        console.error('Email Send Error:', error);
        // We don't throw here to avoid crashing the flow if SMTP is not configured
        // In a real app, you would handle this more gracefully
    }
};

const sendOtpEmail = async (email, otp) => {
    const message = `Your OTP for CareerForge signup is: ${otp}. It expires in 10 minutes.`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #ff2e63;">CareerForge Verification</h2>
            <p>Welcome to CareerForge! Please use the following One-Time Password (OTP) to verify your email address and continue your registration:</p>
            <div style="font-size: 32px; font-weight: bold; color: #ff2e63; letter-spacing: 5px; text-align: center; padding: 20px; background: #f9f9f9; border-radius: 5px; margin: 20px 0;">
                ${otp}
            </div>
            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 CareerForge. All rights reserved.</p>
        </div>
    `;

    console.log('--- DEVELOPMENT OTP LOG ---');
    console.log(`To: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log('---------------------------');

    await sendEmail({
        email,
        subject: 'Email Verification - CareerForge',
        message,
        html,
    });
};

module.exports = { sendEmail, sendOtpEmail };
