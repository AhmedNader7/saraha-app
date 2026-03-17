import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOTP(email, code) {
  const mailOptions = {
    from: `"Sarahah" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Sarahah Verification Code",
    html: `
      <h2>Verification Code</h2>
      <p>Your OTP is: <strong>${code}</strong></p>
      <p>This code expires in 10 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export default transporter;
