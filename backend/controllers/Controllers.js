import { compare, genSalt, hash } from "bcrypt";
import User from "../userschema.js";
import jwt from "jsonwebtoken";
import { sendMail } from "../middleware/middleAuth.js";

export async function getlogin(req, res) {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).send("User not found");
        }

        const isMatch = await compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(401).send("Wrong password");
        }

        if (!user.isverified) {
            return res.status(403).send("Email not verified. Please verify your OTP.");
        }

        const token = jwt.sign(
            {
                name: user.name,
                email: user.email,
                id: user._id,
                cfAcc: user.cfAcc,
                dashboard: user.dashboard
            },
            process.env.JWT_KEY,
            { expiresIn: "1h" }
        );

        return res.status(200).json({ token });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).send("Internal server error");
    }
}

export async function register(req, res) {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
    }
    try {
        const salt = await genSalt(10);
        const hashedPassword = await hash(req.body.password, salt);
        const genOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        console.log(genOtp);
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            otp: genOtp,
            otpExpiry: otpExpiry,
            verified: false
        });
        console.log("Sending otp to user")
        await sendMail(req.body.email, genOtp);
        await newUser.save();

        res.status(201).json({ message: `OTP sent to ${req.body.email}` });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).send("Internal server error");
    }
}

export async function verifyotp(req, res) {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send("User not found");
        }

        if (user.verified) {
            return res.status(400).send("User already verified");
        }

        if (user.otp !== otp) {
            return res.status(401).send("Incorrect OTP");
        }

        if (new Date() > user.otpExpiry) {
            return res.status(410).send("OTP expired");
        }

        user.isverified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        return res.status(200).send("Email verified successfully");
    } catch (error) {
        console.error("OTP verification error:", error);
        return res.status(500).send("Internal server error");
    }
}

export async function kanban(req, res) {
  try {
    const email = (req.query?.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    const user = await User.findOne({ email }, { kanban: 1, _id: 0 });
    if (!user) {
      return res.json({ pending: [], progress: [], completed: [] });
    }
    const { pending = [], progress = [], completed = [] } = user.kanban || {};
    return res.json({ pending, progress, completed });
  } catch (error) {
    console.error("GET /kanban error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

function toStringArray(v) {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x ?? "")).filter(Boolean);
}

export async function expkanban(req, res) {
  try {
    const email = (req.body?.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Email is required in request body." });
    }

    const pending   = toStringArray(req.body?.pending);
    const progress  = toStringArray(req.body?.progress);
    const completed = toStringArray(req.body?.completed);

    // Build only provided fields; but usually you send all three from the client
    const $set = {
      "kanban.pending": pending,
      "kanban.progress": progress,
      "kanban.completed": completed,
    };

    const user = await User.findOneAndUpdate(
      { email },
      { $set },
      { new: true } // return updated doc
      // If you want to auto-create the user (not recommended if you already have auth):
      // { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found for the given email." });
    }

    return res.json({
      message: "Kanban updated.",
      kanban: user.kanban,
    });
  } catch (err) {
    console.error("PUT /kanban error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}
