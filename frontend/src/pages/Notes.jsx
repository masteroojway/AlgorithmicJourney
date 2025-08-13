import React from "react";

const topics = [
  { name: "Introduction", path: "/Topics/start/start1.html" },
  { name: "Sortings", path: "/Topics/sortings/sortings1.html" },
  { name: "Coding Paradigms", path: "/Topics/paradigms/paradigms1.html" },
  { name: "Bitmasking", path: "/Topics/bitmasking/bitmasking1.html" },
  { name: "Number Theory and Math", path: "/Topics/math/math1.html" },
  { name: "Binary Search", path: "/Topics/binary_search/binary_search1.html" },
  { name: "Binary Trees", path: "/Topics/binary_trees/binary_trees1.html" },
  { name: "Graph Theory", path: "/Topics/graphs/graph1.html" },
  { name: "Dynamic Programming", path: "/Topics/dynamic_programming/dynamic_prog1.html" },
  { name: "Object Oriented Programming", path: '/Topics/OOP/oop1.html'}
];

const Notes = () => {
  return (
    <div className="min-h-screen relative bg-[#0b0c0f] text-white font-sans flex flex-col items-center px-4 py-10">
      {/* Background Blur & Gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#101114] via-[#0b0b0c] to-[#050506] animate-pulse opacity-80 blur-sm z-0" />

      {/* Main container */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <div className="flex flex-col items-center gap-5 mb-12 p-6 bg-[#18191c]/60 backdrop-blur-lg rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.4)]">
          <img
            src="/websitelogo.svg"
            alt="Algorithmic Journey Logo"
            className="w-[90px] transition-transform duration-300 hover:scale-105 drop-shadow-[0_0_4px_rgba(77,184,255,0.25)]"
          />
          <h1 className="text-[2.5rem] sm:text-[3.2rem] font-mono font-semibold text-center bg-gradient-to-r from-[#7fbfff] via-[#3997cc] to-[#7fbfff] bg-clip-text text-transparent animate-gradient tracking-wide">
            Algorithmic Journey
          </h1>
        </div>

        {/* Notes Title */}
        <h2 className="text-3xl font-bold text-center mb-8 tracking-wide text-[#7fbfff]">
          Notes
        </h2>

        {/* Topic Links */}
        <div className="flex flex-col items-center">
          {topics.map((topic, index) => (
            <a
              key={index}
              href={topic.path}
              rel="noopener noreferrer"
              className="w-[90%] max-w-[500px] py-5 px-10 my-3 text-lg rounded-xl bg-[#0f1012]/70 border border-white/10 text-white text-center transition-all duration-200 hover:scale-105 hover:border-white/20 shadow-[0_0_12px_rgba(0,0,0,0.25)] hover:shadow-[0_0_18px_rgba(77,184,255,0.25)]"
            >
              {topic.name}
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-12 border-t border-white/10 w-full">
        <div className="mx-auto w-full max-w-4xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
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

export default Notes;
