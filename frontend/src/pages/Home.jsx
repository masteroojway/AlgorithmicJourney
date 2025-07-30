import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token"); // or cookie check
    if (!token) {
      navigate("/login");
    }
  }, []);
  return (
    <div className="min-h-screen bg-[#0b0c0f] text-[#f0f0f0] font-sans flex justify-center px-4 relative overflow-hidden">

      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#101114] via-[#0b0b0c] to-[#050506] animate-pulse opacity-80 blur-sm z-0" />

      {/* Header */}
      <header className="absolute top-0 left-0 w-full z-10 flex justify-between items-center px-6 py-4 bg-transparent backdrop-blur-md">
        <img
          src="/websitelogo.svg"
          alt="Logo"
          className="w-[60px] drop-shadow-[0_0_6px_rgba(77,184,255,0.5)] hover:scale-105 transition-transform"
        />
      </header>

      {/* Content */}
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
          <Link
            to="/notes"
            className="w-[90%] max-w-[500px] py-5 px-10 my-3 text-lg rounded-xl bg-[#1c1c1c] text-white text-center no-underline transition-all duration-200 hover:bg-[#2d2d2d] hover:scale-105"
          >
            Notes
          </Link>

          <Link
            to="/pomodoro"
            className="w-[90%] max-w-[500px] py-5 px-10 my-3 text-lg rounded-xl bg-[#1c1c1c] text-white text-center no-underline transition-all duration-200 hover:bg-[#2d2d2d] hover:scale-105"
          >
            Pomodoro Timer
          </Link>

          <Link
            to="/potd"
            className="w-[90%] max-w-[500px] py-5 px-10 my-3 text-lg rounded-xl bg-[#1c1c1c] text-white text-center no-underline transition-all duration-200 hover:bg-[#2d2d2d] hover:scale-105"
          >
            POTD
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;
