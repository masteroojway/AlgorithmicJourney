import { compare, genSalt, hash } from "bcrypt";
import express from "express"
import { connectDB } from "./config/mongoDB.js";
import dotenv from "dotenv";
import router from "./routes/LoginRoute.js";
import jwt from "jsonwebtoken";
import cors from "cors"


dotenv.config();
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

app.use("/", router);

connectDB().then(()=>{
    app.listen(3000);
    console.log("connected successfully");
})
