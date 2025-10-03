// ============================================
// M4.jsx - Cake Slicing Game
// ============================================
import React, { useState, useEffect } from "react";

const M4 = ({ config, onComplete }) => {
  const [dots, setDots] = useState([]);
  const [flowers, setFlowers] = useState([]);
  const [selectedDots, setSelectedDots] = useState([]);
  const [cuts, setCuts] = useState([]);
  const [message, setMessage] = useState("");

  const RADIUS = 150;
  const CENTER = { x: 200, y: 200 };

  const FIXED_FLOWERS = [
    { id: 0, x: 238.66665649414062, y: 293.6666564941406 },
    { id: 1, x: 240.66665649414062, y: 199.66665649414062 },
    { id: 2, x: 161.66665649414062, y: 263.6666564941406 },
    { id: 3, x: 96.66665649414062, y: 185.66665649414062 },
    { id: 4, x: 157.66665649414062, y: 99.66666412353516 },
    { id: 5, x: 183.66665649414062, y: 172.66665649414062 },
    { id: 6, x: 298.6666564941406, y: 199.66665649414062 },
  ];

  const WINNING_CUTS = [
    [0, 15],
    [21, 10],
    [1, 12],
    [2, 10],
  ];

  useEffect(() => {
    const newDots = Array.from({ length: 24 }, (_, i) => {
      const angle = (2 * Math.PI * i) / 24;
      return {
        id: i,
        x: CENTER.x + RADIUS * Math.cos(angle),
        y: CENTER.y + RADIUS * Math.sin(angle),
      };
    });
    setDots(newDots);
    setFlowers(FIXED_FLOWERS);
  }, []);

  const handleDotClick = (dot) => {
    if (selectedDots.length === 1 && selectedDots[0].id === dot.id) return;

    const newSelected = [...selectedDots, dot];
    setSelectedDots(newSelected);

    if (newSelected.length === 2) {
      const [d1, d2] = newSelected;
      if (Math.abs(d1.id - d2.id) !== 1 && Math.abs(d1.id - d2.id) !== 23) {
        setCuts([...cuts, { d1, d2 }]);
      }
      setSelectedDots([]);
    }
  };

  const handleRestart = () => {
    setCuts([]);
    setSelectedDots([]);
    setMessage("");
  };

  const handleSubmit = () => {
    if (cuts.length !== WINNING_CUTS.length) {
      setMessage("Oops, wrong slicing!");
      return;
    }

    const normalizedCuts = cuts.map(cut =>
      [cut.d1.id, cut.d2.id].sort((a, b) => a - b)
    );

    const allMatch = WINNING_CUTS.every(winCut => {
      const sortedWin = [...winCut].sort((a, b) => a - b);
      return normalizedCuts.some(c => c[0] === sortedWin[0] && c[1] === sortedWin[1]);
    });

    if (allMatch) {
      setMessage("🎉 You won!");
      if (onComplete) {
        setTimeout(() => onComplete(true), 2000);
      }
    } else {
      setMessage("Oops, wrong slicing!");
    }
  };

  return (
    <div className="flex flex-col items-center h-screen justify-center bg-pink-50">
      <svg width="400" height="400" className="rounded-full shadow-lg">
        <circle cx={CENTER.x} cy={CENTER.y} r={RADIUS} fill="#fcd5ce" />

        {flowers.map(f => (
          <circle key={f.id} cx={f.x} cy={f.y} r={8} fill="red" />
        ))}

        {cuts.map((cut, i) => (
          <line
            key={i}
            x1={cut.d1.x}
            y1={cut.d1.y}
            x2={cut.d2.x}
            y2={cut.d2.y}
            stroke="black"
            strokeWidth="2"
          />
        ))}

        {dots.map(d => (
          <circle
            key={d.id}
            cx={d.x}
            cy={d.y}
            r={6}
            fill={selectedDots.find(s => s.id === d.id) ? "#ff7b00" : "#03045e"}
            className="cursor-pointer"
            onClick={() => handleDotClick(d)}
          />
        ))}
      </svg>

      <div className="mt-4 flex gap-4">
        <button
          onClick={handleRestart}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Restart
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-400 rounded"
        >
          Submit
        </button>
      </div>

      {message && <p className="mt-3 font-bold">{message}</p>}
    </div>
  );
};

export default M4;