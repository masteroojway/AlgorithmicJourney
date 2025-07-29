import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"
import toast from "react-hot-toast"
const Register = () => {
    const navigate = useNavigate();
    const [otpmode, setotpmode] = useState(false);
    const [otp, setOtp] = useState("");
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        setotpmode(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/register`, {
                name: form.name,
                email: form.email,
                password: form.password,
            });

            toast.success(response.data.message);

        } catch (error) {
            const errorMsg = error.response?.data?.message || "Registration failed!";
            toast.error(errorMsg);
            console.error(error);
        }

    };
  const handleOtpSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/verify-otp`, {
            email: form.email,
            otp,
        });

        toast.success("OTP verified. You can now login.");
        navigate("/login");
        } catch (error) {
        toast.error("OTP verification failed");
        console.error(error);
        }
    };

  return (
    <div className="min-h-screen bg-[#0b0c0f] text-[#f0f0f0] font-sans flex items-center justify-center px-4 relative overflow-hidden">

      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#101114] via-[#0b0b0c] to-[#050506] animate-pulse opacity-90 blur-[2px]" />

      <form
        onSubmit={handleRegister}
        className="z-10 w-full max-w-md p-8 rounded-[18px] shadow-[0_4px_20px_rgba(0,0,0,0.4)] bg-[#22252A] flex flex-col gap-6"
      >
        <div className="text-center">
          <img
            src="/websitelogo.svg"
            alt="Logo"
            className="w-[70px] mx-auto mb-4 drop-shadow-[0_0_4px_rgba(77,184,255,0.25)] cursor-pointer"
            onClick={()=>navigate("/")}
          />
          <h2 className="text-3xl font-bold font-mono bg-gradient-to-r from-[#7fbfff] via-[#3997cc] to-[#7fbfff] bg-clip-text text-transparent animate-gradient">
            Create Account
          </h2>
        </div>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="p-4 rounded-lg bg-[#2e2e2e] text-white focus:outline-none focus:ring-2 focus:ring-[#3997cc]"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="p-4 rounded-lg bg-[#2e2e2e] text-white focus:outline-none focus:ring-2 focus:ring-[#3997cc]"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="p-4 rounded-lg bg-[#2e2e2e] text-white focus:outline-none focus:ring-2 focus:ring-[#3997cc]"
          value={form.password}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          className="p-4 rounded-lg bg-[#2e2e2e] text-white focus:outline-none focus:ring-2 focus:ring-[#3997cc]"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="bg-[#3997cc] hover:bg-[#2c7aa8] text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-105"
        >
          Register
        </button>

        <p className="text-sm text-center text-gray-400">
          Already have an account?{" "}
          <span
            className="text-[#7fbfff] hover:underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </form>
      {otpmode && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
          <div className="bg-[#22252A] p-6 rounded-xl shadow-lg w-[90%] max-w-sm">
            <h3 className="text-xl font-semibold mb-4 text-center">Enter OTP</h3>
            <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit OTP"
                className="p-3 rounded-lg bg-[#2e2e2e] text-white focus:outline-none focus:ring-2 focus:ring-[#3997cc]"
                maxLength={6}
                required
              />
              <button
                type="submit"
                className="bg-[#3997cc] hover:bg-[#2c7aa8] text-white font-semibold py-2 rounded-lg transition-all duration-200 hover:scale-105"
              >
                Verify OTP
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
