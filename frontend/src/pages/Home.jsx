import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(() => {
    return localStorage.getItem("dashboard") || "compsci";
  });

  // Persist preference
  useEffect(() => {
    localStorage.setItem("dashboard", dashboard);
  }, [dashboard]);

  useEffect(() => {
    const token = localStorage.getItem("token"); // or cookie check
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0b0c0f] text-[#f0f0f0] font-sans flex justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#101114] via-[#0b0b0c] to-[#050506] animate-pulse opacity-80 blur-sm z-0 pointer-events-none" />

      <header className="absolute top-0 left-0 w-full z-10 flex justify-between items-center px-6 py-4 bg-transparent backdrop-blur-md">
        <img
          src="/websitelogo.svg"
          alt="Logo"
          className="w-[60px] drop-shadow-[0_0_6px_rgba(77,184,255,0.5)] hover:scale-105 transition-transform"
        />

        <div
          className="inline-flex items-center rounded-xl border border-white/10 bg-[#1b1c1f]/70 shadow-[0_0_20px_rgba(0,0,0,0.3)] overflow-hidden"
          role="tablist"
          aria-label="Select dashboard"
        >
          <button
            role="tab"
            aria-selected={dashboard === "compsci"}
            onClick={() => setDashboard("compsci")}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
              dashboard === "compsci"
                ? "bg-gradient-to-r from-[#3997cc] to-[#7fbfff] text-black"
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            Computer Science
          </button>
          <button
            role="tab"
            aria-selected={dashboard === "electronics"}
            onClick={() => setDashboard("electronics")}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
              dashboard === "electronics"
                ? "bg-gradient-to-r from-[#3997cc] to-[#7fbfff] text-black"
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            Electronics
          </button>
        </div>
      </header>

      <main className="relative z-10 mt-28 max-w-4xl mx-auto">
        <div className="flex flex-col items-center gap-5 mb-12 p-6 bg-[#18191c]/60 backdrop-blur-lg rounded-[18px] shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
          <img
            src="/websitelogo.svg"
            alt="Algorithmic Journey Logo"
            className="w-[90px] transition-transform duration-300 hover:scale-105 drop-shadow-[0_0_4px_rgba(77,184,255,0.25)]"
          />

          <h1 className="text-[2.5rem] sm:text-[3.2rem] font-mono font-semibold text-center bg-gradient-to-r from-[#7fbfff] via-[#3997cc] to-[#7fbfff] bg-clip-text text-transparent animate-gradient tracking-wide">
            Algorithmic Journey
          </h1>
        </div>

        <div className="flex flex-col items-center">
          {(dashboard === "compsci" &&
          <Link
            to="/notes"
            className="w-[90%] max-w-[500px] py-5 px-10 my-3 text-lg rounded-xl bg-[#1c1c1c] text-white text-center no-underline transition-all duration-200 hover:bg-[#2d2d2d] hover:scale-105"
          >
            Notes
          </Link>
          )}

          <Link
            to="/pomodoro"
            className="w-[90%] max-w-[500px] py-5 px-10 my-3 text-lg rounded-xl bg-[#1c1c1c] text-white text-center no-underline transition-all duration-200 hover:bg-[#2d2d2d] hover:scale-105"
          >
            Pomodoro Timer
          </Link>
          {(dashboard === "compsci" &&
          <Link
            to="/potd"
            className="w-[90%] max-w-[500px] py-5 px-10 my-3 text-lg rounded-xl bg-[#1c1c1c] text-white text-center no-underline transition-all duration-200 hover:bg-[#2d2d2d] hover:scale-105"
          >
            POTD
          </Link>)
          } 
        </div>
      </main>
    </div>
  );
};

export default Home;
