import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [remaining, setRemaining] = useState(25 * 60);
  const [isPaused, setIsPaused] = useState(true);
  const [isWork, setIsWork] = useState(true);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [weeklyData, setWeeklyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);

  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const startTimeRef = useRef(null);
  const expectedTimeRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const baseURL = import.meta.env.VITE_BASE_URL;

  // Initialize audio only once
  useEffect(() => {
    audioRef.current = new Audio('/alarm.wav');
    audioRef.current.preload = 'auto';
  }, []);

  const formatTime = useCallback((seconds) => 
    `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    navigate('/login');
  }, [navigate]);

  const checkAuth = useCallback(() => {
    if (!token) return logout();
    try {
      const { exp } = jwtDecode(token);
      if (exp * 1000 < Date.now()) return logout();
      setCheckedAuth(true);
    } catch {
      logout();
    }
  }, [token, logout]);

  const fetchPomodoroData = useCallback(async () => {
    try {
      const res = await axios.get(`${baseURL}/pomodoro`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setWeeklyData(res.data.weekly || []);
      setDailyData(res.data.daily || []);
    } catch (err) {
      console.error("❌ Fetch failed", err);
      setWeeklyData([]);
      setDailyData([]);
    }
  }, [baseURL, token]);

  const updatePomodoro = useCallback(async (minutes) => {
    const now = new Date();
    const weekIndex = Math.floor(((now - new Date(now.getFullYear(), 0, 1)) / 1000 / 60 / 60 / 24 - now.getDay() + 1) / 7);
    const dayIndex = (now.getDay() + 6) % 7;

    try {
      await axios.put(`${baseURL}/pomodoro`, { minutes, weekIndex, dayIndex }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPomodoroData();
    } catch (err) {
      console.error('❌ Failed to update pomodoro:', err);
    }
  }, [baseURL, token, fetchPomodoroData]);

  const handleSelect = useCallback((setter, shouldReset) => (e) => {
    const value = +e.target.value;
    setter(value);
    if (isPaused && shouldReset) setRemaining(value * 60);
  }, [isPaused]);

  const handleTimerToggle = useCallback(() => {
    setIsPaused(prev => {
      if (prev) {
        // Starting timer - set reference times
        startTimeRef.current = Date.now();
        expectedTimeRef.current = startTimeRef.current + (remaining * 1000);
      }
      return !prev;
    });
  }, [remaining]);

  const handleReset = useCallback(() => {
    setIsPaused(true);
    setIsWork(true);
    setRemaining(workMin * 60);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
    expectedTimeRef.current = null;
  }, [workMin]);

  // Optimized timer with drift correction
  const tick = useCallback(() => {
    const now = Date.now();
    const timeLeft = Math.max(0, Math.round((expectedTimeRef.current - now) / 1000));
    
    setRemaining(timeLeft);
    
    if (timeLeft === 0) {
      // Timer finished
      audioRef.current?.play().catch(err => console.warn('🔕 Audio error:', err));
      if (isWork) updatePomodoro(workMin);
      
      const nextDuration = isWork ? breakMin : workMin;
      setIsWork(!isWork);
      setIsPaused(true);
      setRemaining(nextDuration * 60);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      startTimeRef.current = null;
      expectedTimeRef.current = null;
    }
  }, [isWork, workMin, breakMin, updatePomodoro]);

  // Auth check effects
  useEffect(() => {
    checkAuth();
    const visibilityHandler = () => document.visibilityState === 'visible' && checkAuth();
    window.addEventListener('storage', checkAuth);
    document.addEventListener('visibilitychange', visibilityHandler);
    return () => {
      window.removeEventListener('storage', checkAuth);
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  }, [checkAuth]);

  useEffect(() => {
    if (checkedAuth) fetchPomodoroData();
  }, [checkedAuth, fetchPomodoroData]);

  // Timer interval management
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start timer
    intervalRef.current = setInterval(tick, 100); // Check every 100ms for smoother updates
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, tick]);

  const chartConfigs = [
    {
      title: 'Weekly Study Progress',
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: dailyData,
      borderColor: '#00FFAB'
    },
    {
      title: 'Yearly Study Trend',
      labels: Array.from({ length: 52 }, (_, i) => `Week ${i + 1}`),
      data: weeklyData,
      borderColor: '#3997cc'
    }
  ];

  const percentage = (remaining / ((isWork ? workMin : breakMin) * 60)) * 100;

  if (!checkedAuth) return <div className="h-screen flex items-center justify-center text-white bg-black">Checking authentication...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0c0f] to-[#14151a] text-white">
      <header className="sticky top-0 z-20 bg-[#0e0f12]/80 backdrop-blur-lg py-4 px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#7fbfff] via-[#3997cc] to-[#00FFAB] bg-clip-text text-transparent">Pomodoro</h1>
          <Link to="/home" className="border border-white/10 px-4 py-2 rounded-xl text-sm hover:bg-[#2a2a2a] bg-[#1d1d1d] transition">Home</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-10">
        {/* Timer */}
        <section className="bg-[#1a1c20] rounded-xl shadow-md p-6 flex flex-col items-center">
          <div className="w-[min(70vw,300px)] h-[min(70vw,300px)] p-4">
            <CircularProgressbar
              value={percentage}
              text={formatTime(remaining)}
              styles={buildStyles({
                textColor: '#fff',
                pathColor: isWork ? '#00FFAB' : '#3997cc',
                trailColor: '#1e1e1e'
              })}
            />
          </div>

          <div className="flex mt-6 gap-6">
            <img src={isPaused ? '/playbtn.svg' : '/pausebtn.svg'} alt="Toggle" onClick={handleTimerToggle} className="w-14 h-14 hover:scale-105 transition cursor-pointer" />
            <img src="/resetbtn.svg" alt="Reset" onClick={handleReset} className="w-14 h-14 hover:scale-105 transition cursor-pointer" />
          </div>

          <div className="flex gap-4 mt-6 text-sm">
            {[{ label: 'Work', val: workMin, set: setWorkMin, isCurr: isWork }, { label: 'Break', val: breakMin, set: setBreakMin, isCurr: !isWork }].map(({ label, val, set, isCurr }) => (
              <label key={label} className="flex flex-col items-center">
                <span className="mb-1 text-xs text-gray-300">{label}</span>
                <select value={val} onChange={handleSelect(set, isCurr)} className="bg-black border border-white/20 rounded px-3 py-1 focus:ring focus:ring-opacity-30 transition">
                  {(label === 'Work' ? [15, 20, 25, 30, 35, 40] : [3, 5, 10, 15]).map(m => <option key={m}>{m}</option>)}
                </select>
              </label>
            ))}
          </div>
        </section>

        {/* Charts */}
        <section className="space-y-8">
          {chartConfigs.map(({ title, labels, data, borderColor }) => (
            <div key={title} className="bg-[#1a1c20] p-4 rounded-xl shadow-md">
              <h2 className="text-lg font-semibold mb-3 text-[#cbd5e1]">{title}</h2>
              <Line
                data={{
                  labels,
                  datasets: [{ label: 'Minutes', data, borderColor, backgroundColor: `${borderColor}33`, tension: 0.4 }]
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { color: '#aaa' }, grid: { color: '#2c2c2c' } },
                    y: { ticks: { color: '#aaa' }, grid: { color: '#2c2c2c' } }
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