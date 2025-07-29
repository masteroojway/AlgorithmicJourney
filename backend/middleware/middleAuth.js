import jwt from "jsonwebtoken";
import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config();

export function requireAuth(req,res,next){
    const header = req.headers.authorization;
    if(!header || !header.startsWith("Bearer "))
    {
        return res.status(401).send("No token provided");
    }
    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).send("Invalid request");
    }
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "ujjwalhyd@gmail.com",
    pass: process.env.GMAIL_PASS,
  },
});

export async function sendMail(mail, genotp) {
  try {
    const info = await transporter.sendMail({
      from: '"Algorithmic Journey" <ujjwalhyd@gmail.com>',
      to: mail,
      subject: "Verify your Algorithmic Journey account",
      text: `Your OTP is ${genotp}`,
      html: `<p>Your OTP is <b>${genotp}</b>. It will expire in 5 minutes.</p>`,
    });

  } catch (error) {
    console.error(error);
    throw error; 
  }
}

