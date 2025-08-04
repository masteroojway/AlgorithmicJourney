import jwt from "jsonwebtoken";
import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config();

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  console.log("🛡️ Auth header received:", header);

  if (!header || !header.startsWith("Bearer ")) {
    console.log("❌ Invalid or missing Bearer token");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded;
    console.log("🔓 Auth success:", decoded.email);
    next();
  } catch (err) {
    console.log("❌ Token verification failed:", err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
}


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "journeyalgorithmic@gmail.com",
    pass: process.env.GMAIL_PASS,
  },
});

export async function sendMail(mail, genotp) {
  try {
    const info = await transporter.sendMail({
      from: '"Algorithmic Journey" <journeyalgorithmic@gmail.com>',
      to: mail,
      subject: "Verify your Algorithmic Journey account",
      text: `Your OTP is ${genotp}`,
      html: `<p>
        Hi there! To complete your login to <em>Algorithmic Journey</em>, use this code:<br>
        <strong><code>${genotp}</code></strong><br>
        This code will expire in 5 minutes.
      </p>
      `,
    });

  } catch (error) {
    console.error(error);
    throw error; 
  }
}

