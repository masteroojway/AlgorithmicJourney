import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/login`, {
        email,
        password,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/home");
      } else {
        alert(res.data.message || "Login failed");
      }
    } catch (error) {
        console.error(error);

        if (error.response?.status === 403) {
            toast.error("Email not verified. Please check your email and verify OTP.");
        } else if (error.response?.status === 401) {
            toast.error("Incorrect password.");
        } else if (error.response?.status === 404) {
            toast.error("User not found.");
        } else {
            toast.error("Login failed. Try again later.");
        }
    }

  };

  return (
    <div className="min-h-screen bg-[#0b0c0f] text-[#f0f0f0] font-sans flex items-center justify-center px-4 relative overflow-hidden">

      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#101114] via-[#0b0b0c] to-[#050506] animate-pulse opacity-90 blur-[2px]" />

      <form
        onSubmit={handleLogin}
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
            Welcome Back
          </h2>
        </div>

        <input
          type="email"
          placeholder="Email"
          className="p-4 rounded-lg bg-[#2e2e2e] text-white focus:outline-none focus:ring-2 focus:ring-[#3997cc]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="p-4 rounded-lg bg-[#2e2e2e] text-white focus:outline-none focus:ring-2 focus:ring-[#3997cc]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-[#3997cc] hover:bg-[#2c7aa8] text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-105"
        >
          Login
        </button>

        <p className="text-sm text-center text-gray-400">
          Don’t have an account?{" "}
          <span
            className="text-[#7fbfff] hover:underline cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
