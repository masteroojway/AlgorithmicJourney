import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Plain JS: compute initial value safely (no TS types)
const getInitialDashboard = () => {
  if (typeof window === "undefined") return "compsci";
  const stored = window.localStorage.getItem("dashboard");
  return stored === "electronics" || stored === "compsci" ? stored : "compsci";
};

/** Base64url → JSON decoder for JWT payload */
function decodeJwt(token) {
  try {
    const base64Url = token?.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Is the JWT currently valid (has a future exp)? */
function isTokenActive(payload) {
  if (!payload || typeof payload.exp !== "number") return false;
  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp > nowSec;
}

const Home = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(getInitialDashboard);
  const [checkedAuth, setCheckedAuth] = useState(false); // avoid UI flash before auth check
  const expiryTimerRef = useRef(null);

  // helpers for gradient switching
  const isCS = dashboard === "compsci";
  const csGrad = "bg-gradient-to-r from-[#3997cc] to-[#7fbfff]";
  const elGrad = "bg-gradient-to-r from-[#34d399] to-[#a7f3d0]";

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("dashboard", dashboard);
    }
  }, [dashboard]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const clearExpiryTimer = () => {
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
        expiryTimerRef.current = null;
      }
    };

    const enforceAuth = () => {
      const token = window.localStorage.getItem("token");
      if (!token) {
        setCheckedAuth(true);
        navigate("/login");
        return;
      }
      const payload = decodeJwt(token);
      if (!isTokenActive(payload)) {
        // Optional: remove the stale token
        window.localStorage.removeItem("token");
        setCheckedAuth(true);
        navigate("/login");
        return;
      }

      // Schedule auto-redirect exactly at expiry
      clearExpiryTimer();
      const msUntilExpiry = payload.exp * 1000 - Date.now();
      if (msUntilExpiry > 0) {
        expiryTimerRef.current = setTimeout(() => {
          window.localStorage.removeItem("token");
          navigate("/login");
        }, msUntilExpiry + 50);
      }

      setCheckedAuth(true);
    };

    enforceAuth();

    // Re-check if token changes in another tab
    const onStorage = (e) => {
      if (e.key === "token") enforceAuth();
    };
    window.addEventListener("storage", onStorage);

    // Re-check when tab becomes visible (in case it expired while hidden)
    const onVisibility = () => {
      if (document.visibilityState === "visible") enforceAuth();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
      clearExpiryTimer();
    };
  }, [navigate]);

  // Optionally render nothing until we've confirmed auth, to prevent a flash of content
  if (!checkedAuth) return null;

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
              isCS ? `${csGrad} text-black` : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            Computer Science
          </button>
          <button
            role="tab"
            aria-selected={dashboard === "electronics"}
            onClick={() => setDashboard("electronics")}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
              !isCS ? `${elGrad} text-black` : "text-gray-300 hover:text-white hover:bg-white/5"
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

          <h1
            className={`text-[2.5rem] sm:text-[3.2rem] font-mono font-semibold text-center 
            bg-gradient-to-r ${
              isCS
                ? "from-[#7fbfff] via-[#3997cc] to-[#7fbfff]" // blue for compsci
                : "from-[#a7f3d0] via-[#34d399] to-[#a7f3d0]" // green for electronics
            } bg-clip-text text-transparent animate-gradient tracking-wide`}
          >
            Algorithmic Journey
          </h1>
        </div>

        <div className="flex flex-col items-center">
          {isCS && (
            <Link
              to="/notes"
              className="w-[90%] max-w-[500px] py-5 px-10 my-3 text-lg rounded-xl bg-[#1c1c1c] text-white text-center no-underline transition-all duration-200 hover:bg-[#2d2d2d] hover:scale-105"
            >
              Notes
            </Link>
          )}

          {isCS && (
            <Link
              to="/potd"
              className="w-[90%] max-w-[500px] py-5 px-10 my-3 text-lg rounded-xl bg-[#1c1c1c] text-white text-center no-underline transition-all duration-200 hover:bg-[#2d2d2d] hover:scale-105"
            >
              Problem of the Day
            </Link>
          )}

          <Link
            to="/pomodoro"
            className="w-[90%] max-w-[500px] py-5 px-10 my-3 text-lg rounded-xl bg-[#1c1c1c] text-white text-center no-underline transition-all duration-200 hover:bg-[#2d2d2d] hover:scale-105"
          >
            Pomodoro Timer
          </Link>

          <Link
            to="/kanban"
            className="w-[90%] max-w-[500px] py-5 px-10 my-3 text-lg rounded-xl bg-[#1c1c1c] text-white text-center no-underline transition-all duration-200 hover:bg-[#2d2d2d] hover:scale-105"
          >
            Kanban Board
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;
