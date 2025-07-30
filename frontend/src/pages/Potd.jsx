import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Safe JWT decode (no verification) with Base64URL padding handling
function decodeJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

async function getRating(handle) {
  const res = await fetch(
    `https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`
  );
  const data = await res.json();
  if (data.status !== "OK" || !data.result?.length) {
    throw new Error(data.comment || "Could not fetch Codeforces user.");
  }
  // user.info returns current rating directly on the user object
  const user = data.result[0];
  return typeof user.rating === "number" ? user.rating : 900; // default for unrated
}

async function getRandomProblems(x, y) {
  const res = await fetch("https://codeforces.com/api/problemset.problems");
  const data = await res.json();
  if (data.status !== "OK") throw new Error(data.comment || "API error");

  // Filter by rating range and ensure contestId/index exist
  const filtered = (data.result?.problems || []).filter(
    (p) => p.rating && p.rating >= x && p.rating <= y && p.contestId && p.index
  );

  if (filtered.length < 9) {
    throw new Error("Not enough problems in this rating range.");
  }

  // Shuffle and take 9
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  const slice = shuffled.slice(0, 9);

  return slice.map((p) => ({
    id: `${p.contestId}-${p.index}`,
    name: p.name,
    rating: p.rating,
    tags: p.tags || [],
    link: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
  }));
}

const Potd = () => {
  const navigate = useNavigate();

  const [cfHandle, setCfHandle] = useState("");
  const [rating, setRating] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingSets, setLoadingSets] = useState(false);

  const [problems, setProblems] = useState([]);     // Normal
  const [thinkProblems, setThinkProblems] = useState([]); // Think Hard

  const [handleInput, setHandleInput] = useState("");
  const [error, setError] = useState("");

  // Derived text for rating chip
  const ratingText = useMemo(() => {
    if (rating == null) return "";
    return `Rating: ${rating}`;
  }, [rating]);

  // Load handle from token/localStorage, then fetch rating & sets
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const payload = decodeJwt(token);
      if (!payload) {
        navigate("/login");
        return;
      }
      const handleFromToken = payload?.cfAcc ?? "";
      const fallbackLocal = localStorage.getItem("cfAcc") ?? "";
      const handle = handleFromToken || fallbackLocal;

      if (!handle) {
        // No handle — show the form
        setCfHandle("");
        setLoading(false);
        return;
      }

      setCfHandle(handle);
      try {
        setLoading(true);
        const r = await getRating(handle);
        setRating(r);
        // initial load of problem sets
        const [norm, think] = await Promise.all([
          getRandomProblems(r - 100, r + 200),
          getRandomProblems(r + 100, r + 300),
        ]);
        setProblems(norm);
        setThinkProblems(think);
      } catch (e) {
        setError(e?.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const loadSets = useCallback(
    async (r) => {
      try {
        setLoadingSets(true);
        const [norm, think] = await Promise.all([
          getRandomProblems(r - 100, r + 200),
          getRandomProblems(r + 100, r + 300),
        ]);
        setProblems(norm);
        setThinkProblems(think);
      } catch (e) {
        setError(e?.message || "Failed to load problems.");
      } finally {
        setLoadingSets(false);
      }
    },
    []
  );

  const submitCfHandle = useCallback(
    async (e) => {
      e.preventDefault();
      const trimmed = handleInput.trim();
      if (!trimmed) {
        setError("Please enter your Codeforces handle.");
        return;
      }
      setError("");
      localStorage.setItem("cfAcc", trimmed);
      setCfHandle(trimmed);

      try {
        setLoading(true);
        const r = await getRating(trimmed);
        setRating(r);
        await loadSets(r);
      } catch (err) {
        setError(err?.message || "Could not fetch rating for this handle.");
      } finally {
        setLoading(false);
      }
    },
    [handleInput, loadSets]
  );

  const refreshAll = useCallback(async () => {
    if (rating == null) return;
    await loadSets(rating);
  }, [rating, loadSets]);

  // ---------- Render ----------

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-3 bg-[#18191c]/60 backdrop-blur-lg border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(77,184,255,0.18)] px-5 py-3"
        >
          <span className="inline-block w-5 h-5 rounded-full border-2 border-white/25 border-t-white/80 animate-spin" />
          <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#7fbfff] via-[#3997cc] to-[#7fbfff]">
            Loading
          </span>
        </div>
      </div>
    );
  }

  // Ask for handle if not present
  if (cfHandle === "") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <form
          onSubmit={submitCfHandle}
          className="w-full max-w-md bg-[#18191c]/60 backdrop-blur-lg rounded-3xl border border-white/10 p-6 space-y-4 shadow-[0_0_30px_rgba(0,0,0,0.4)]"
        >
          <h2 className="text-xl font-semibold text-white">
            Add your Codeforces handle
          </h2>
          <p className="text-sm text-gray-400">
            We need your Codeforces ID to personalize your Problem of the Day.
          </p>

          <input
            type="text"
            value={handleInput}
            onChange={(e) => setHandleInput(e.target.value)}
            placeholder="e.g., tourist"
            className="w-full rounded-xl bg-[#0f1013] border border-white/10 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3997cc]"
            autoFocus
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#3997cc] to-[#7fbfff] text-black font-semibold hover:opacity-95 transition-opacity shadow-[0_0_10px_rgba(77,184,255,0.3)]"
            >
              Save & Continue
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c0f] text-white relative px-6 py-10">
      {/* Subtle animated gradient background like DefaultLanding */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#101114] via-[#0b0b0c] to-[#050506] animate-pulse opacity-80 blur-sm z-0" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header area */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#7fbfff] via-[#3997cc] to-[#7fbfff] drop-shadow-[0_0_10px_rgba(77,184,255,0.3)]">
              Problem of the Day
            </h1>
            <p className="text-gray-300 mt-1">
              Signed in as{" "}
              <span className="text-white/90 font-mono">@{cfHandle}</span>
              {rating != null && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#1c1c1c] border border-white/10">
                  {ratingText}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {error && (
              <span className="text-sm text-red-400 bg-[#18191c]/60 border border-red-500/20 px-3 py-1 rounded-xl">
                {error}
              </span>
            )}
            <button
              onClick={refreshAll}
              disabled={loadingSets}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#3997cc] to-[#7fbfff] text-black font-semibold hover:opacity-95 transition-opacity shadow-[0_0_10px_rgba(77,184,255,0.3)] disabled:opacity-60"
              aria-busy={loadingSets}
            >
              {loadingSets ? "Refreshing…" : "Refresh sets"}
            </button>
          </div>
        </div>

        {/* Normal Problems */}
        <section className="mt-8">
          <div className="bg-[#18191c]/60 backdrop-blur-lg rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.4)] p-6">
            <header className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Today’s Set</h2>
              <p className="text-sm text-gray-400">
                A balanced mix around your level.
              </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {problems.map((p) => (
                <article
                  key={p.id}
                  className="group rounded-2xl bg-[#0f1013] border border-white/10 p-4 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold leading-snug">{p.name}</h3>
                    <span className="text-xs shrink-0 px-2 py-0.5 rounded-full bg-[#1c1c1c] border border-white/10">
                      {p.rating}
                    </span>
                  </div>
                  {p.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.tags.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-[#18191c] border border-white/10 text-gray-300"
                        >
                          {t}
                        </span>
                      ))}
                      {p.tags.length > 4 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#18191c] border border-white/10 text-gray-400">
                          +{p.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mt-3 flex justify-end">
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-[#1c1c1c] hover:bg-[#2d2d2d] border border-white/10 transition-colors"
                    >
                      Solve →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Think Hard Problems */}
        <section className="mt-8">
          <div className="bg-[#18191c]/60 backdrop-blur-lg rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.4)] p-6">
            <header className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Think Hard</h2>
              <p className="text-sm text-gray-400">
                A bit above your comfort zone — stretch problems.
              </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {thinkProblems.map((p) => (
                <article
                  key={p.id}
                  className="group rounded-2xl bg-[#0f1013] border border-white/10 p-4 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold leading-snug">{p.name}</h3>
                    <span className="text-xs shrink-0 px-2 py-0.5 rounded-full bg-[#1c1c1c] border border-white/10">
                      {p.rating}
                    </span>
                  </div>
                  {p.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.tags.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-[#18191c] border border-white/10 text-gray-300"
                        >
                          {t}
                        </span>
                      ))}
                      {p.tags.length > 4 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#18191c] border border-white/10 text-gray-400">
                          +{p.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mt-3 flex justify-end">
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#3997cc] to-[#7fbfff] text-black hover:opacity-95 transition-opacity shadow-[0_0_10px_rgba(77,184,255,0.3)] hover:scale-105"
                    >
                      Try it →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Potd;
