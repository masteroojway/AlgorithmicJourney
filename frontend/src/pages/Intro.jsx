import { Link } from "react-router-dom";

const DefaultLanding = () => {
  return (
    <div className="min-h-screen bg-[#0b0c0f] text-white font-sans relative flex flex-col overflow-x-visible overflow-y-auto">
      {/* Subtle animated gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#101114] via-[#0b0b0c] to-[#050506] animate-pulse opacity-80 blur-sm z-0" />

      {/* Header (fixed, responsive) */}
      <header className="fixed top-0 left-0 w-full z-10 bg-transparent backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <img
              src="/websitelogo.svg"
              alt="Logo"
              className="w-[48px] sm:w-[60px] drop-shadow-[0_0_6px_rgba(77,184,255,0.5)] hover:scale-105 transition-transform"
            />
            <div className="flex gap-3 w-full sm:w-auto justify-center sm:justify-end">
              <Link
                to="/login"
                className="w-full sm:w-auto text-center px-4 sm:px-5 py-2 bg-[#1d1d1d] hover:bg-[#2a2a2a] rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all hover:scale-105"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto text-center px-4 sm:px-5 py-2 bg-[#3997cc] hover:bg-[#2c7aa8] text-white rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all hover:scale-105"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 pt-24 px-4 sm:px-6 py-12 pb-24">
        {/* Hero */}
        <div className="w-full max-w-3xl mx-auto text-center mb-10">
          <div className="bg-[#18191c]/60 backdrop-blur-lg rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.4)] px-6 py-12 animate-fadeInUp">
            <h1 className="text-4xl sm:text-6xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#7fbfff] via-[#3997cc] to-[#7fbfff] animate-gradient tracking-normal sm:tracking-wide drop-shadow-[0_0_10px_rgba(77,184,255,0.3)] mb-6 pr-2 overflow-visible inline-block">
              Welcome to Algorithmic Journey
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-10">
              Your personal guide to mastering algorithms, problem solving,
              and learning tools — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#3997cc] to-[#7fbfff] text-black font-bold text-base transition-all hover:scale-105 shadow-[0_0_10px_rgba(77,184,255,0.3)]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <section className="w-full max-w-6xl mx-auto">
          <h2 className="sr-only">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Pomodoro */}
            <article className="bg-[#18191c]/60 backdrop-blur-lg rounded-2xl border border-white/10 shadow-[0_0_25px_rgba(0,0,0,0.35)] p-5">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold">Pomodoro</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#1c1c1c] border border-white/10">
                  Focus
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-300">
                Stay productive with work/break cycles, long breaks, and session stats.
              </p>
              <div className="mt-4">
                <Link
                  to="/pomodoro"
                  className="inline-block text-sm font-semibold px-3 py-1.5 rounded-lg bg-[#1c1c1c] hover:bg-[#2d2d2d] border border-white/10 transition-colors"
                >
                  Open Pomodoro →
                </Link>
              </div>
            </article>

            {/* Notes */}
            <article className="bg-[#18191c]/60 backdrop-blur-lg rounded-2xl border border-white/10 shadow-[0_0_25px_rgba(0,0,0,0.35)] p-5">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold">Notes</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#1c1c1c] border border-white/10">
                  Organize
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-300">
                Clean, searchable notes for concepts, tricks, and code snippets.
              </p>
              <div className="mt-4">
                <Link
                  to="/notes"
                  className="inline-block text-sm font-semibold px-3 py-1.5 rounded-lg bg-[#1c1c1c] hover:bg-[#2d2d2d] border border-white/10 transition-colors"
                >
                  Go to Notes →
                </Link>
              </div>
            </article>

            {/* Problem of the Day */}
            <article className="bg-[#18191c]/60 backdrop-blur-lg rounded-2xl border border-white/10 shadow-[0_0_25px_rgba(0,0,0,0.35)] p-5">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold">Problem of the Day</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#1c1c1c] border border-white/10">
                  Practice
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-300">
                Daily Codeforces picks tailored to your rating: normal &amp; challenge.
              </p>
              <div className="mt-4">
                <Link
                  to="/potd"
                  className="inline-block text-sm font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#3997cc] to-[#7fbfff] text-black hover:opacity-95 transition-opacity shadow-[0_0_10px_rgba(77,184,255,0.3)]"
                >
                  View POTD →
                </Link>
              </div>
            </article>
          </div>
        </section>
      </main>

      {/* Footer (sticks to bottom) */}
      <footer className="relative z-10 mt-auto border-t border-white/10 w-full">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Algorithmic Journey</p>
          <a
            href="https://github.com/masteroojway/AlgorithmicJourney"
            className="hover:text-white transition-colors underline underline-offset-4"
            target="_blank"
            rel="noreferrer noopener"
          >
            Contribute on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
};

export default DefaultLanding;
