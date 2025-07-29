import { compare, genSalt, hash } from "bcrypt";
import express from "express";
import { connectDB } from "./config/mongoDB.js";
import dotenv from "dotenv";
import router from "./routes/LoginRoute.js";
import jwt from "jsonwebtoken";
import cors from "cors";

dotenv.config();

const app = express();

const allowedOrigins = process.env.FRONTEND_URL?.split(",").map(url => url.trim()) || [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS Not Allowed: " + origin));
    }
  },
  credentials: true,
}));


app.use(express.json());
app.use("/", router);

connectDB().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
