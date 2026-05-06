const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
    try {
        await resend.emails.send({
            from: 'CareerForge <onboarding@resend.dev>', // default working sender
            to: options.email,
            subject: options.subject,
            html: options.html || `<p>${options.message}</p>`,
        });

        console.log(`Email sent to ${options.email}`);
    } catch (error) {
        console.error('Email Send Error:', error);
    }
};

const sendOtpEmail = async (email, otp) => {
    const message = `Your OTP for CareerForge signup is: ${otp}. It expires in 10 minutes.`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #ff2e63;">CareerForge Verification</h2>
            <p>Welcome to CareerForge! Please use the following One-Time Password (OTP) to verify your email address:</p>
            <div style="font-size: 32px; font-weight: bold; color: #ff2e63; letter-spacing: 5px; text-align: center; padding: 20px; background: #f9f9f9; border-radius: 5px; margin: 20px 0;">
                ${otp}
            </div>
            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 CareerForge</p>
        </div>
    `;

    console.log('--- OTP SENT ---');
    console.log(`To: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log('----------------');

    await sendEmail({
        email,
        subject: 'Email Verification - CareerForge',
        message,
        html,
    });
};

module.exports = { sendEmail, sendOtpEmail };