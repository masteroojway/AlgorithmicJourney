import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DndContext,
  PointerSensor,
  TouchSensor,          // ✅ add TouchSensor
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";

/* ---------------------------- tiny helpers ---------------------------- */
const COLS = { pending: "pending", progress: "progress", completed: "completed" };
const makeId = () => (crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`);
const cx = (...c) => c.filter(Boolean).join(" ");
const ensureObjects = (arr) => (arr || []).map((x) => (typeof x === "object" && x?.id ? x : { id: makeId(), text: String(x) }));
const decode = (t) => { try { const p = JSON.parse(atob(t?.split(".")[1] || "")); return p || null; } catch { return null; } };
const toText = (list) => list.map((x) => x.text ?? x);

/* ---------------------------- small UI bits --------------------------- */
const Skeleton = () => <div className="h-9 w-full rounded-lg bg-white/5 animate-pulse border border-white/10" />;
const Empty = ({ label }) => <div className="rounded-xl border border-dashed border-white/10 bg-black/10 p-4 text-center text-sm text-gray-400">No {label} yet.</div>;

/** Draggable card */
const Card = ({ id, text, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const handleDelete = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete?.(id);
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cx(
        // ✅ touch-none helps mobile drags (prevents browser from hijacking the gesture)
        "group relative touch-none bg-[#0f1012]/70 border border-white/10 rounded-xl px-3 py-2",
        "shadow-[0_0_12px_rgba(0,0,0,0.25)] hover:shadow-[0_0_18px_rgba(77,184,255,0.25)]",
        "transition-all hover:scale-[1.01] hover:border-white/20 select-none cursor-grab active:cursor-grabbing",
        isDragging && "opacity-80 ring-1 ring-[#7fbfff]/40"
      )}
    >
      <button
        onClick={handleDelete}
        title="Delete"
        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100
                   px-2 h-6 rounded-md text-xs font-semibold
                   bg-[#1c1c1c] border border-white/10 hover:bg-[#2a2a2a]
                   transition-opacity"
      >
        ×
      </button>

      <div className="flex items-center gap-2 pr-8">
        <span className="inline-block h-2 w-2 rounded-full bg-white/40 group-hover:bg-white/70 transition-colors" />
        <p className="text-sm text-gray-200">{String(text)}</p>
      </div>
    </div>
  );
};

const OverlayCard = ({ text }) => (
  <div className="bg-[#0f1012]/80 border border-white/20 rounded-xl px-3 py-2 shadow-[0_0_22px_rgba(77,184,255,0.35)]">
    <div className="flex items-center gap-2">
      <span className="inline-block h-2 w-2 rounded-full bg-white/60" />
      <p className="text-sm text-gray-100">{String(text)}</p>
    </div>
  </div>
);

/** Column droppable area */
const Column = ({ title, badge, items, loading, id, onQuickAdd, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <article className="bg-[#18191c]/60 backdrop-blur-lg rounded-2xl border border-white/10 shadow-[0_0_25px_rgba(0,0,0,0.35)] p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => onQuickAdd(id)} className="text-xs px-2 py-0.5 rounded-lg bg-[#1c1c1c] border border-white/10 hover:bg-[#2a2a2a]">+ Add</button>
          <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[#1c1c1c] border border-white/10">{badge}</span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cx(
          // ✅ touch-none here improves dropping into empty/large spaces on mobile
          "mt-3 space-y-2.5 min-h-[48px] transition-colors touch-none",
          isOver && "bg-white/5 rounded-xl"
        )}
      >
        {loading ? (<><Skeleton /><Skeleton /><Skeleton /></>) : items.length ? children : <Empty label={title.toLowerCase()} />}
      </div>
    </article>
  );
};

/* ------------------------------- component ------------------------------ */
export default function Kanban() {
  const navigate = useNavigate();

  const [board, setBoard] = useState({ pending: [], progress: [], completed: [] });
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const [newText, setNewText] = useState("");
  const [newCol, setNewCol] = useState(COLS.pending);
  const [adding, setAdding] = useState(false);
  const addRef = useRef(null);

  // ✅ Sensors: TouchSensor with a small delay to distinguish scroll vs drag
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const all = useMemo(() => [...board.pending, ...board.progress, ...board.completed], [board]);
  const activeItem = useMemo(() => all.find((x) => x.id === activeId) || null, [all, activeId]);

  const token = useMemo(() => localStorage.getItem("token"), []);
  const email = useMemo(() => decode(token)?.email?.toLowerCase(), [token]);
  const api = useMemo(() => axios.create({ baseURL: import.meta.env.VITE_BASE_URL }), []);

  useEffect(() => { if (!token) navigate("/login"); }, [token, navigate]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!email) return;
      try {
        setLoading(true);
        const res = await api.get("/kanban", { params: { email } });
        if (!mounted) return;
        setBoard({
          pending: ensureObjects(res.data?.pending),
          progress: ensureObjects(res.data?.progress),
          completed: ensureObjects(res.data?.completed),
        });
      } catch (e) {
        console.warn("GET /kanban failed:", e?.message || e);
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [api, email]);

  const persist = async (next) => {
    if (!email) return;
    try {
      await api.put("/kanban", {
        email,
        pending: toText(next.pending),
        progress: toText(next.progress),
        completed: toText(next.completed),
      });
    } catch (e) {
      console.warn("PUT /kanban failed:", e?.message || e);
    }
  };

  const findCol = (itemId) => {
    if (board.pending.some((x) => x.id === itemId)) return COLS.pending;
    if (board.progress.some((x) => x.id === itemId)) return COLS.progress;
    if (board.completed.some((x) => x.id === itemId)) return COLS.completed;
    return null;
  };

  /* add / delete */
  const handleAdd = async (e) => {
    e?.preventDefault?.();
    const text = newText.trim();
    if (!text) return addRef.current?.focus();
    setAdding(true);
    const next = { ...board, [newCol]: [...board[newCol], { id: makeId(), text }] };
    setBoard(next);
    setNewText("");
    await persist(next);
    setAdding(false);
    addRef.current?.focus();
  };

  const quickAdd = (col) => { setNewCol(col); addRef.current?.focus(); };

  const removeItem = async (itemId) => {
    const next = {
      pending: board.pending.filter((x) => x.id !== itemId),
      progress: board.progress.filter((x) => x.id !== itemId),
      completed: board.completed.filter((x) => x.id !== itemId),
    };
    setBoard(next);
    await persist(next);
  };

  const clearCompleted = async () => {
    if (!board.completed.length) return;
    const next = { ...board, completed: [] };
    setBoard(next);
    await persist(next);
  };

  /* drag & drop */
  const onDragStart = ({ active }) => setActiveId(active.id);

  const onDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) return;

    const from = findCol(active.id);
    const to = Object.values(COLS).includes(over.id) ? over.id : (findCol(over.id) || from);
    if (!from || !to) return;

    if (from === to && over.id && !Object.values(COLS).includes(over.id)) {
      const list = board[from];
      const oi = list.findIndex((x) => x.id === active.id);
      const ni = list.findIndex((x) => x.id === over.id);
      if (oi === -1 || ni === -1 || oi === ni) return;
      const moved = arrayMove(list, oi, ni);
      const next = { ...board, [from]: moved };
      setBoard(next);
      persist(next);
      return;
    }

    const fromList = [...board[from]];
    const toList = [...board[to]];
    const fromIdx = fromList.findIndex((x) => x.id === active.id);
    const [moved] = fromList.splice(fromIdx, 1);

    let insertAt = toList.length; // append if dropped on column body
    if (!Object.values(COLS).includes(over.id)) {
      const overIdx = toList.findIndex((x) => x.id === over.id);
      insertAt = overIdx >= 0 ? overIdx : toList.length;
    }
    toList.splice(insertAt, 0, moved);

    const next = { ...board, [from]: fromList, [to]: toList };
    setBoard(next);
    persist(next);
  };

  /* render */
  return (
    <div className="min-h-screen bg-[#0b0c0f] text-white font-sans relative flex flex-col overflow-x-visible">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#101114] via-[#0b0b0c] to-[#050506] animate-pulse opacity-80 blur-sm z-0" />

      <header className="sticky top-0 left-0 w-full z-20 bg-transparent backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#7fbfff] via-[#3997cc] to-[#7fbfff] animate-gradient drop-shadow-[0_0_10px_rgba(77,184,255,0.3)]">
              Kanban Board
            </h1>
            <div className="flex gap-3">
              <Link to="/home" className="px-4 py-2 bg-[#1d1d1d] hover:bg-[#2a2a2a] rounded-xl text-xs sm:text-sm font-semibold border border-white/10">Home</Link>
              <Link to="/notes" className="px-4 py-2 bg-[#3997cc] hover:bg-[#2a2a2a] text-black rounded-xl text-xs sm:text-sm font-semibold shadow-[0_0_10px_rgba(77,184,255,0.3)]">Notes</Link>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-4 sm:px-6 py-8 sm:py-12 pb-24">
        <div className="w-full max-w-5xl mx-auto text-center mb-6 sm:mb-10">
          <div className="bg-[#18191c]/60 backdrop-blur-lg rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.4)] px-4 sm:px-6 py-6 sm:py-8">
            <p className="text-sm sm:text-base text-gray-300">
              Track tasks across <b>Pending</b>, <b>In Progress</b>, and <b>Completed</b>. Drag to reorder or move.
            </p>

            {/* Add Task */}
            <form onSubmit={handleAdd} className="mt-6 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-center">
              <input
                ref={addRef}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Add a new task…"
                className="w-full rounded-xl bg-[#0f1012]/70 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3997cc]/40"
              />
              <select
                value={newCol}
                onChange={(e) => setNewCol(e.target.value)}
                className="rounded-xl bg-[#0f1012]/70 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3997cc]/40"
              >
                <option value={COLS.pending}>Pending</option>
                <option value={COLS.progress}>In Progress</option>
                <option value={COLS.completed}>Completed</option>
              </select>
              <button type="submit" disabled={adding} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#3997cc] to-[#7fbfff] text-black text-sm font-semibold shadow-[0_0_10px_rgba(77,184,255,0.3)] hover:opacity-95 disabled:opacity-60">
                {adding ? "Adding…" : "Add Task"}
              </button>
            </form>

            {/* Bulk clear completed */}
            <div className="mt-3 flex justify-end">
              <button
                onClick={clearCompleted}
                disabled={!board.completed.length}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#1c1c1c] border border-white/10 hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Completed ({board.completed.length})
              </button>
            </div>
          </div>
        </div>

        {/* Columns */}
        <section className="w-full max-w-6xl mx-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            modifiers={[restrictToWindowEdges]}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {[
                { key: COLS.pending, title: "Pending", badge: "Queue" },
                { key: COLS.progress, title: "In Progress", badge: "Focus" },
                { key: COLS.completed, title: "Completed", badge: "Done" },
              ].map(({ key, title, badge }) => (
                <SortableContext
                  key={key}
                  id={key}
                  items={board[key].map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Column
                    title={title}
                    badge={badge}
                    items={board[key]}
                    loading={loading}
                    id={key}
                    onQuickAdd={quickAdd}
                  >
                    {board[key].map((item) => (
                      <Card key={item.id} id={item.id} text={item.text} onDelete={removeItem} />
                    ))}
                  </Column>
                </SortableContext>
              ))}
            </div>

            <DragOverlay>{activeItem && <OverlayCard text={activeItem.text} />}</DragOverlay>
          </DndContext>
        </section>
      </main>

      <footer className="relative z-10 mt-auto border-t border-white/10 w-full">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Algorithmic Journey</p>
          <a href="https://github.com/masteroojway/AlgorithmicJourney" className="hover:text-white underline underline-offset-4" target="_blank" rel="noreferrer noopener">Contribute on GitHub</a>
        </div>
      </footer>
    </div>
  );
}
