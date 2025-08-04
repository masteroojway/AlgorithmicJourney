import React, { useEffect, useState, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Link, useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const Pomodoro = () => {
  // Pomodoro settings & state
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [isPaused, setIsPaused] = useState(true);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [remaining, setRemaining] = useState(25 * 60);

  // Analytics
  const [weeklyData, setWeeklyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [checkedAuth, setCheckedAuth] = useState(false);

  // Refs for timer logic
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const updatedThisCycle = useRef(false);
  const navigate = useNavigate();

  const percentage = (remaining / ((isWorkSession ? workMin : breakMin) * 60)) * 100;

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    clearInterval(intervalRef.current);
    navigate('/login');
  };

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) return logout();
    try {
      const { exp } = jwtDecode(token);
      if (exp * 1000 < Date.now()) return logout();
      setCheckedAuth(true);
    } catch {
      logout();
    }
  };

  const fetchPomodoroData = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/pomodoro`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWeeklyData(res.data.weekly || []);
      setDailyData(res.data.daily || []);
    } catch {
      setWeeklyData([]);
      setDailyData([]);
    }
  };

  const updatePomodoro = async (minutes) => {
    const token = localStorage.getItem('token');
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const weekIndex = Math.floor((now - yearStart) / (7 * 24 * 60 * 60 * 1000));
    const dayIndex = (now.getDay() + 6) % 7;

    try {
      await axios.put(`${import.meta.env.VITE_BASE_URL}/pomodoro`, {
        minutes,
        weekIndex,
        dayIndex
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/pomodoro`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setWeeklyData(res.data.weekly || []);
      setDailyData(res.data.daily || []);
    } catch (err) {
      console.error("Failed to update or fetch pomodoro data.");
    }
  };

  const handleSelect = (setFn, shouldResetTimer) => (e) => {
    const value = +e.target.value;
    setFn(value);
    if (isPaused && shouldResetTimer) {
      setRemaining(value * 60);
    }
  };

  useEffect(() => {
    checkAuth();
    const handleVisibility = () => document.visibilityState === 'visible' && checkAuth();
    window.addEventListener('storage', checkAuth);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('storage', checkAuth);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (checkedAuth) fetchPomodoroData();
  }, [checkedAuth]);

  useEffect(() => {
    if (isPaused) {
      clearInterval(intervalRef.current);
      return;
    }

    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);

          // Log session if it was a work session and hasn't been logged yet
          if (isWorkSession && !updatedThisCycle.current) {
            const elapsedMin = Math.floor((Date.now() - startTimeRef.current) / 60000);
            if (elapsedMin > 0) {
              updatePomodoro(elapsedMin);
              updatedThisCycle.current = true;
            }
          }

          const nextSession = isWorkSession ? breakMin : workMin;
          setIsWorkSession(!isWorkSession);
          setIsPaused(true);
          return nextSession * 60;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isPaused, isWorkSession, workMin, breakMin]);

  const chartData = [
    {
      title: 'Weekly Study Progress',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Minutes',
          data: dailyData,
          borderColor: '#00FFAB',
          backgroundColor: 'rgba(0,255,171,0.2)'
        }]
      }
    },
    {
      title: 'Yearly Study Trend',
      data: {
        labels: Array.from({ length: 52 }, (_, i) => `Week ${i + 1}`),
        datasets: [{
          label: 'Minutes per Week',
          data: weeklyData,
          borderColor: '#3997cc',
          backgroundColor: 'rgba(57,151,204,0.2)',
          tension: 0.3
        }]
      }
    }
  ];

  if (!checkedAuth) {
    return <div className="h-screen flex items-center justify-center text-white bg-black">Checking authentication...</div>;
  }

  return (
  <div className="min-h-screen bg-gradient-to-b from-[#0b0c0f] to-[#14151a] text-white flex flex-col font-sans">
    <header className="sticky top-0 z-20 bg-[#0e0f12]/80 backdrop-blur-lg py-4 px-6 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#7fbfff] via-[#3997cc] to-[#00FFAB] bg-clip-text text-transparent">
          Pomodoro
        </h1>
        <Link
          to="/home"
          className="bg-[#1d1d1d] hover:bg-[#2a2a2a] transition px-4 py-2 rounded-xl text-sm border border-white/10"
        >
          Home
        </Link>
      </div>
    </header>

    <main className="flex-1 px-6 py-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
      {/* Timer Section */}
      <section className="flex flex-col items-center justify-center bg-[#1a1c20] p-6 rounded-xl shadow-md">
        <div className="w-[min(70vw,300px)] h-[min(70vw,300px)] p-4">
          <CircularProgressbar
            value={percentage}
            text={formatTime(remaining)}
            styles={buildStyles({
              textColor: '#fff',
              pathColor: isWorkSession ? '#00FFAB' : '#3997cc',
              trailColor: '#1e1e1e'
            })}
          />
        </div>

        <div className="flex mt-6 gap-6">
          <img
            src={isPaused ? '/playbtn.svg' : '/pausebtn.svg'}
            alt="Toggle"
            className="w-14 h-14 hover:scale-105 transition cursor-pointer"
            onClick={() => {
              if (isPaused) updatedThisCycle.current = false;
              setIsPaused(prev => !prev);
            }}
          />
          <img
            src="/resetbtn.svg"
            alt="Reset"
            className="w-14 h-14 hover:scale-105 transition cursor-pointer"
            onClick={() => {
              setIsPaused(true);
              setIsWorkSession(true);
              setRemaining(workMin * 60);
            }}
          />
        </div>

        <div className="flex gap-4 mt-6 text-sm">
          <label className="flex flex-col items-center">
            <span className="mb-1 text-xs text-gray-300">Work</span>
            <select
              value={workMin}
              onChange={handleSelect(setWorkMin, isWorkSession)}
              className="bg-black border border-white/20 rounded px-3 py-1 focus:ring focus:ring-[#00FFAB]/30 transition"
            >
              {[1, 15, 20, 25, 30, 35, 40].map(min => (
                <option key={min}>{min}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col items-center">
            <span className="mb-1 text-xs text-gray-300">Break</span>
            <select
              value={breakMin}
              onChange={handleSelect(setBreakMin, !isWorkSession)}
              className="bg-black border border-white/20 rounded px-3 py-1 focus:ring focus:ring-[#3997cc]/30 transition"
            >
              {[3, 5, 7, 10, 15].map(min => (
                <option key={min}>{min}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* Chart Section */}
      <section className="space-y-8">
        {chartData.map(({ title, data }) => (
          <div key={title} className="bg-[#1a1c20] rounded-xl p-4 shadow-md">
            <h2 className="text-lg font-semibold mb-3 text-[#cbd5e1]">{title}</h2>
            <Line
              data={data}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  x: {
                    ticks: { color: '#aaa' },
                    grid: { color: '#2c2c2c' }
                  },
                  y: {
                    ticks: { color: '#aaa' },
                    grid: { color: '#2c2c2c' }
                  }
                }
              }}
            />
          </div>
        ))}
      </section>
    </main>
  </div>
);

};

export default Pomodoro;
