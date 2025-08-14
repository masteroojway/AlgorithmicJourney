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
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!Array.isArray(user.pomodoroHistory)) user.pomodoroHistory = Array(52).fill(0);
  if (!Array.isArray(user.dailyPomodoro)) user.dailyPomodoro = Array(7).fill(0);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentWeekIndex = Math.floor(
    ((now - new Date(currentYear, 0, 1)) / 1000 / 60 / 60 / 24 - now.getDay() + 1) / 7
  );

  // Reset yearly data on Jan 1
  if (!user.lastPomodoroUpdate || user.lastPomodoroUpdate.getFullYear() < currentYear) {
    user.pomodoroHistory = Array(52).fill(0);
  }

  // Reset weekly data on Monday
  const lastUpdateWeekDay = user.lastPomodoroUpdate?.getDay(); // 0 = Sunday, 1 = Monday...
  const todayWeekDay = now.getDay();
  if (!user.lastPomodoroUpdate || todayWeekDay === 1 && lastUpdateWeekDay !== 1) {
    user.dailyPomodoro = Array(7).fill(0);
  }

  user.pomodoroHistory[currentWeekIndex] += minutes;
  user.dailyPomodoro[dayIndex] += minutes;

  user.lastPomodoroUpdate = now;

  await user.save();
  res.json({ message: "Updated" });
});


export default router;