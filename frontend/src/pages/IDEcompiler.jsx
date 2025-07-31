import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function decodeJwt(token) {
  try {
    const base64Url = token?.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function isTokenActive(payload) {
  if (!payload || typeof payload.exp !== "number") return false;
  return payload.exp > Math.floor(Date.now() / 1000);
}

const IDEcompiler = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const expiryTimerRef = useRef(null);
  const [charCount, setCharCount] = useState(0);
  const MAX_CODE_LENGTH = 5000;

  useEffect(() => {
    const enforceAuth = () => {
      if (!token) {
        setCheckedAuth(true);
        return navigate("/login");
      }
      const payload = decodeJwt(token);
      if (!isTokenActive(payload)) {
        localStorage.removeItem("token");
        return navigate("/login");
      }
      const msUntilExpiry = payload.exp * 1000 - Date.now();
      expiryTimerRef.current = setTimeout(() => {
        localStorage.removeItem("token");
        navigate("/login");
      }, msUntilExpiry + 50);
      setCheckedAuth(true);
    };

    enforceAuth();

    const onStorage = (e) => {
      if (e.key === "token") enforceAuth();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") enforceAuth();
    };

    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimeout(expiryTimerRef.current);
    };
  }, [navigate, token]);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/template`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCode(res.data[language] || "");
        setCharCount((res.data[language] || "").length);
      } catch (err) {
        console.error("Template fetch failed:", err);
      }
    };
    if (token) fetchTemplate();
  }, [language]);

  const saveTemplate = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/template`,
        { language, code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Template saved!");
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save.");
    }
  };

  if (!checkedAuth) return null;

  return (
    <div className="min-h-screen bg-[#0b0c0f] text-white">
      <header className="sticky top-0 w-full z-20 bg-transparent backdrop-blur-md shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7fbfff] to-[#3997cc] animate-gradient">
            IDE Compiler
          </h1>
          <Link to="/home" className="bg-[#1d1d1d] hover:bg-[#2a2a2a] rounded-lg px-4 py-2 text-sm font-semibold border border-white/10">
            Home
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 bg-[#18191c]/70 rounded-2xl shadow-md backdrop-blur-md mt-6">
        <div className="flex gap-4 mb-4 items-center">
          <label htmlFor="language" className="text-sm font-medium">Language:</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#1f1f1f] text-white border border-gray-700 rounded-md px-3 py-2"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        <textarea
          value={code}
          onChange={(e) => {
            const newCode = e.target.value;
            if (newCode.length <= MAX_CODE_LENGTH) {
              setCode(newCode);
              setCharCount(newCode.length);
            }
          }}
          rows="14"
          className="w-full font-mono text-sm bg-black text-white border border-gray-700 rounded-lg p-4 resize-none mb-2"
          placeholder="Write your code..."
        />

        <div className="text-sm text-gray-400 mb-4 text-right">
          {charCount}/{MAX_CODE_LENGTH} characters
        </div>

        <button
          onClick={saveTemplate}
          disabled={charCount > MAX_CODE_LENGTH}
          className={`px-6 py-2 rounded-lg font-semibold ${
            charCount > MAX_CODE_LENGTH
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Save Template
        </button>
      </main>
    </div>
  );
};

export default IDEcompiler;
