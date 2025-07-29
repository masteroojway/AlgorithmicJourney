import React, { useEffect, useState, useRef } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate } from 'react-router-dom';

const Pomodoro = () => {
  const [paused, setPaused] = useState(true);
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [remaining, setRemaining] = useState(workMin * 60);
  const [mode, setMode] = useState(true); // true = work, false = break
  const intervalRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token"); // or cookie check
    if (!token) {
      navigate("/login");
    }
  }, []);
  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

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

  const percentage = (remaining / (mode ? workMin * 60 : breakMin * 60)) * 100;

  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row items-center justify-center bg-[#0b0c0f] text-white p-4 md:p-10 gap-10">
      
      <div className="flex flex-col items-center justify-center w-full md:w-1/2">
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
      </div>
      <div className="w-full md:w-1/2 flex flex-col items-center md:items-start justify-center text-white gap-6 bg-white/10 p-8 md:p-10 rounded-xl">
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
          {paused
            ? "You can change durations when timer is paused."
            : "Pause timer to change settings."}
        </p>
      </div>
    </div>
  );
};

export default Pomodoro;
