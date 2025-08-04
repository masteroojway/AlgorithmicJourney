import express from "express"
import { expkanban, getlogin, getTemplates, kanban, register, saveTemplates, verifyotp } from "../controllers/Controllers.js";
import { requireAuth } from "../middleware/middleAuth.js";
import User from "../userschema.js";

const router = express.Router();

router.post("/login", getlogin);
router.post("/register", register);
router.get("/home", requireAuth, (req, res) => {
    res.status(200).json({
        message: `Welcome, ${req.user.name}! This is a protected route.`,
        user: req.user
    });
})
router.post("/verify-otp", verifyotp);
router.get("/kanban", kanban);

router.put("/kanban", expkanban);

router.get("/template", requireAuth, getTemplates);
router.put("/template", requireAuth, saveTemplates);

router.get("/pomodoro", requireAuth, async (req, res) => {
  console.log("📥 GET /pomodoro route hit");
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.status(200).json({
    message: "Pomodoro GET success",
    weekly: user.pomodoroHistory || [],
    daily: user.dailyPomodoro || [],
  });
});
router.put("/pomodoro", requireAuth, async (req, res) => {
  const { minutes, weekIndex, dayIndex } = req.body;
    console.log("[PUT /pomodoro] Request body:", req.body);
  const user = await User.findById(req.user.id);
  if (!user) {
    console.log("[PUT /pomodoro] User not found:", req.user.id);
    return res.status(404).json({ error: "User not found" });
  }
  console.log("[PUT /pomodoro] Before update:", {
    weekly: user.pomodoroHistory?.[weekIndex],
    daily: user.dailyPomodoro?.[dayIndex]
  });
  if (!Array.isArray(user.pomodoroHistory)) user.pomodoroHistory = Array(52).fill(0);
  if (!Array.isArray(user.dailyPomodoro)) user.dailyPomodoro = Array(7).fill(0);

  user.pomodoroHistory[weekIndex] += minutes;
  user.dailyPomodoro[dayIndex] += minutes;
  await user.save();
  console.log("[PUT /pomodoro] After update:", {
    weekly: user.pomodoroHistory?.[weekIndex],
    daily: user.dailyPomodoro?.[dayIndex]
  });
  res.json({ message: "Updated" });
});

export default router;