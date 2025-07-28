import express from "express"
import { getlogin, register } from "../controllers/Controllers.js";
import { requireAuth } from "../middleware/middleAuth.js";

const router = express.Router();

router.post("/login", getlogin);
router.post("/register", register);
router.get("/home", requireAuth, (req, res) => {
    res.status(200).json({
        message: `Welcome, ${req.user.name}! This is a protected route.`,
        user: req.user
    });
})
export default router;