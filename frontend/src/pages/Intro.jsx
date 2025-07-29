import { Link } from "react-router-dom";

const DefaultLanding = () => {
  return (
    <div className="min-h-screen bg-[#0b0c0f] text-white font-sans relative overflow-y-hidden overflow-x-visible flex items-center justify-center px-6 py-12">

      {/* Subtle animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#101114] via-[#0b0b0c] to-[#050506] animate-pulse opacity-80 blur-sm z-0" />

      {/* Header */}
      <header className="absolute top-0 left-0 w-full z-10 flex justify-between items-center px-6 py-4 bg-transparent backdrop-blur-md">
        <img
          src="/websitelogo.svg"
          alt="Logo"
          className="w-[60px] drop-shadow-[0_0_6px_rgba(77,184,255,0.5)] hover:scale-105 transition-transform"
        />

        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-5 py-2 bg-[#1d1d1d] hover:bg-[#2a2a2a] rounded-xl text-sm font-semibold tracking-wide transition-all hover:scale-105"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 bg-[#3997cc] hover:bg-[#2c7aa8] text-white rounded-xl text-sm font-semibold tracking-wide transition-all hover:scale-105"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="z-10 w-full max-w-3xl text-center">
        <div className="bg-[#18191c]/60 backdrop-blur-lg rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.4)] px-6 py-12 animate-fadeInUp">

          <h1 className="text-4xl sm:text-6xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#7fbfff] via-[#3997cc] to-[#7fbfff] animate-gradient tracking-normal sm:tracking-wide drop-shadow-[0_0_10px_rgba(77,184,255,0.3)] mb-6 pr-2 overflow-visible inline-block">
            Welcome to Algorithmic Journey
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-10">
            Your personal guide to mastering algorithms, problem solving,
            and learning tools — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/notes"
              className="px-6 py-3 rounded-xl bg-[#1c1c1c] hover:bg-[#2d2d2d] text-white font-semibold text-base transition-all hover:scale-105"
            >
              Explore Notes
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#3997cc] to-[#7fbfff] text-black font-bold text-base transition-all hover:scale-105 shadow-[0_0_10px_rgba(77,184,255,0.3)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DefaultLanding;
