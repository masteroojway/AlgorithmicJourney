import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please enter a valid email address"
        ],
    },
    password: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
    },
    otpExpiry: {
        type: Date,
    },
    isverified: {
        type: Boolean,
        default: false
    },
    cfAcc: {
        type: String,
        default: null,
    },
    kanban: {
        type: Object,
        default: () => ({
            pending: [],
            progress: [],
            completed: []
        })
    },
    templates: {
        java: { type: String, default: "" },
        cpp: { type: String, default: "" },
        python: { type: String, default: "" },
    },
    pomodoroHistory: {
        type: [Number],
        default: Array(52).fill(0),
        },
    dailyPomodoro: {
        type: [Number],
        default: Array(7).fill(0),
    },


},{timestamps: true})

const User = mongoose.model("User", userSchema);
export default User;