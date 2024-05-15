import nodemailer from "nodemailer";
import { randomBytes } from "crypto";
import dotenv from "dotenv";
dotenv.config();

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // or 465 for SSL
  secure: false, // true for 465, false for other ports
  service: "gmail",
  auth: {
    user: process.env.HOST_EMAIL_USER, // host Gmail email address
    pass: process.env.HOST_EMAIL_PASSWORD, // host Gmail password
  },
});

// Function to generate OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

// Function to send OTP to email
export const sendOTPToEmail = async (email, otp, user_type) => {
  try {
    // Email content
    const mailOptions = {
      from: process.env.HOST_EMAIL_USER, // Sender's email address
      to: email, // Recipient's email address
      subject: `OTP for Registration of ${email} as ${user_type} user.`, // Email subject
      text: `Your OTP for registration is: ${otp}`, // Email body
    };
    // Send email
    await transporter.sendMail(mailOptions);
    console.log("Email sent !")
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
