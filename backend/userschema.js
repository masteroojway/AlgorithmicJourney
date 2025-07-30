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
    }
},{timestamps: true})

const User = mongoose.model("User", userSchema);
export default User;