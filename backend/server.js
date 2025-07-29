import { compare, genSalt, hash } from "bcrypt";
import express from "express";
import { connectDB } from "./config/mongoDB.js";
import dotenv from "dotenv";
import router from "./routes/LoginRoute.js";
import jwt from "jsonwebtoken";
import cors from "cors";
import serverless from "serverless-http";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use("/", router);

let isConnected = false;

const handler = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
    console.log("MongoDB connected successfully");
  }

  return await serverless(app)(req, res);
};

export default handler ;
