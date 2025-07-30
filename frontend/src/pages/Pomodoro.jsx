import React, { useEffect, useState, useRef } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Link, useNavigate } from 'react-router-dom';

/** Decode JWT payload (base64url → JSON) */
function decodeJwt(token) {
  try {
    const base64Url = token?.split('.')?.[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Is token active? (has future `exp`) */
function isTokenActive(payload) {
  if (!payload || typeof payload.exp !== 'number') return false;
  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp > nowSec;
}

const Pomodoro = () => {
  const [paused, setPaused] = useState(true);
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [remaining, setRemaining] = useState(workMin * 60);
  const [mode, setMode] = useState(true); // true = work, false = break
  const [checkedAuth, setCheckedAuth] = useState(false); // prevent flash before auth check

  const intervalRef = useRef(null);
  const expiryTimerRef = useRef(null);
  const navigate = useNavigate();

  /** ---- Auth enforcement (missing/expired token → /login) ---- */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const clearExpiryTimer = () => {
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
        expiryTimerRef.current = null;
      }
    };

    const stopPomodoroTimer = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setPaused(true);
    };

    const redirectToLogin = () => {
      window.localStorage.removeItem('token'); // optional, ensures stale token is cleared
      stopPomodoroTimer();
      navigate('/login');
    };

    const enforceAuth = () => {
      const token = window.localStorage.getItem('token');
      if (!token) {
        setCheckedAuth(true);
        redirectToLogin();
        return;
      }
      const payload = decodeJwt(token);
      if (!isTokenActive(payload)) {
        setCheckedAuth(true);
        redirectToLogin();
        return;
      }

      // schedule auto-redirect at exact expiry
      clearExpiryTimer();
      const msUntilExpiry = payload.exp * 1000 - Date.now();
      if (msUntilExpiry > 0) {
        expiryTimerRef.current = setTimeout(() => {
          redirectToLogin();
        }, msUntilExpiry + 50);
      }

      setCheckedAuth(true);
    };

    enforceAuth();

    const onStorage = (e) => {
      if (e.key === 'token') enforceAuth();
    };
    window.addEventListener('storage', onStorage);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') enforceAuth();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibility);
      clearExpiryTimer();
    };
  }, [navigate]);

  /** ---- Pomodoro ticking ---- */
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (paused) return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev === 0) {
          const isWork = mode;
          setMode(!isWork);
          return isWork ? breakMin * 60 : workMin * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [paused, mode, workMin, breakMin]);

  const handleReset = () => {
    setPaused(true);
    setMode(true);
    setRemaining(workMin * 60);
  };

  const handleWorkTimeChange = (e) => {
    const newTime = parseInt(e.target.value);
    setWorkMin(newTime);
    if (paused && mode) setRemaining(newTime * 60);
  };

  const handleBreakTimeChange = (e) => {
    const newTime = parseInt(e.target.value);
    setBreakMin(newTime);
    if (paused && !mode) setRemaining(newTime * 60);
  };

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const percentage = (remaining / (mode ? workMin * 60 : breakMin * 60)) * 100;

  if (!checkedAuth) return null;

  return (
    <div className="min-h-screen bg-[#0b0c0f] text-white font-sans relative flex flex-col overflow-x-visible">
      {/* Subtle animated gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#101114] via-[#0b0b0c] to-[#050506] animate-pulse opacity-80 blur-sm z-0" />

      {/* ------- Header (matches Kanban style) ------- */}
      <header className="sticky top-0 left-0 w-full z-20 bg-transparent backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#7fbfff] via-[#3997cc] to-[#7fbfff] animate-gradient drop-shadow-[0_0_10px_rgba(77,184,255,0.3)]">
              Pomodoro
            </h1>
            <div className="flex gap-3">
              <Link
                to="/home"
                className="px-4 py-2 bg-[#1d1d1d] hover:bg-[#2a2a2a] rounded-xl text-xs sm:text-sm font-semibold border border-white/10"
              >
                Home
              </Link>

            </div>
          </div>
        </div>
      </header>

      {/* ------- Main ------- */}
      <main className="relative z-10 flex-1 px-4 sm:px-6 py-8 sm:py-12 pb-24">
        <div className="mx-auto w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Timer side */}
          <section className="flex flex-col items-center justify-center">
            <div className="w-[min(70vw,300px)] h-[min(70vw,300px)] p-4">
              <CircularProgressbar
                value={percentage}
                text={formatTime(remaining)}
                styles={buildStyles({
                  textColor: '#fff',
                  pathColor: mode ? '#00FFAB' : '#3997cc',
                  trailColor: '#1e1e1e',
                })}
              />
            </div>

            <div className="flex mt-6">
              <img
                src={paused ? `/playbtn.svg` : `/pausebtn.svg`}
                alt="Toggle Timer"
                className="size-15 hover:scale-105 m-6 cursor-pointer"
                onClick={() => setPaused(!paused)}
              />
              <img
                src="/resetbtn.svg"
                alt="Reset Timer"
                className="size-15 hover:scale-105 m-6 cursor-pointer"
                onClick={handleReset}
              />
            </div>
          </section>

          {/* Controls side */}
          <section className="w-full flex flex-col items-center md:items-start justify-center text-white gap-6 bg-white/10 p-8 md:p-10 rounded-xl border border-white/10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-300">Adjust Timer</h2>

            <div className="w-full">
              <label className="mr-2 text-gray-400">Work Duration:</label>
              <select
                className="bg-[#1e1e1e] p-2 rounded text-white w-full md:w-auto mt-1"
                value={workMin}
                onChange={handleWorkTimeChange}
                disabled={!paused}
              >
                {[15, 25, 35, 45, 60].map((min) => (
                  <option key={min} value={min}>
                    {min} min
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full">
              <label className="mr-2 text-gray-400">Break Duration:</label>
              <select
                className="bg-[#1e1e1e] p-2 rounded text-white w-full md:w-auto mt-1"
                value={breakMin}
                onChange={handleBreakTimeChange}
                disabled={!paused}
              >
                {[5, 10, 15, 20, 30].map((min) => (
                  <option key={min} value={min}>
                    {min} min
                  </option>
                ))}
              </select>
            </div>

            <p className="text-sm text-gray-500 mt-4 text-center md:text-left">
              {paused ? 'You can change durations when timer is paused.' : 'Pause timer to change settings.'}
            </p>
          </section>
        </div>
      </main>

      <footer className="relative z-10 mt-auto border-t border-white/10 w-full">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Algorithmic Journey</p>
          <a
            href="https://github.com/masteroojway/AlgorithmicJourney"
            className="hover:text-white underline underline-offset-4"
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

export default Pomodoro;
