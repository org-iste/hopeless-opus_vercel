import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { BsTrash } from "react-icons/bs";
import MinigameTimer from "../components/MinigameTimer";

/* ---------- Constants ---------- */
const hiddenMapping = { red: 2, blue: 5, green: 7, yellow: 3, purple: 4, orange: 6 };

const colorPalette = {
  red: { label: "Red", bg: "from-red-500 to-red-600", text: "text-white" },
  blue: { label: "Blue", bg: "from-blue-500 to-blue-600", text: "text-white" },
  green: { label: "Green", bg: "from-green-500 to-green-600", text: "text-white" },
  yellow: { label: "Yellow", bg: "from-yellow-400 to-yellow-500", text: "text-gray-800" },
  purple: { label: "Purple", bg: "from-purple-500 to-purple-600", text: "text-white" },
  orange: { label: "Orange", bg: "from-orange-400 to-orange-500", text: "text-white" },
};

const equations = [
    { id: 1, text: "Red + Blue + Green", expected: ["red", "blue", "green"], total: 14, description: "Primary Colors" },
    { id: 2, text: "Blue + Yellow + Purple", expected: ["blue", "yellow", "purple"], total: 12, description: "Cool Tones" },
    { id: 3, text: "Green + Yellow + Orange", expected: ["green", "yellow", "orange"], total: 16, description: "Nature Colors" },
    { id: 4, text: "Red + Purple + Orange", expected: ["red", "purple", "orange"], total: 12, description: "Warm Mix" },
    { id: 5, text: "Blue + Green + Purple", expected: ["blue", "green", "purple"], total: 16, description: "Jewel Tones" },
    { id: 6, text: "Red + Yellow + Blue", expected: ["red", "yellow", "blue"], total: 10, description: "Primary Mix" },
    { id: 7, text: "Green + Purple + Orange", expected: ["green", "purple", "orange"], total: 17, description: "Deep Colors" }
]
    

const computeCakeValue = (cake) =>
  cake?.expected?.reduce((s, k) => s + (hiddenMapping[k] || 0), 0) ?? 0;

/* ---------- Cake Visual ---------- */
function CakeVisual({ cake, small = false, highlight = false }) {
  if (!cake) return null;
  return (
    <div
      className={`flex flex-col items-center ${small ? "text-xs" : "text-sm"} ${
        highlight ? "ring-2 ring-blue-400 rounded-lg" : ""
      }`}
    >
      <div className="relative flex flex-col-reverse items-center">
        {cake.expected.map((colorKey, idx) => {
          const width = small ? 60 - idx * 8 : 120 - idx * 16;
          const height = small ? 18 - idx * 2 : 36 - idx * 4;
          const cp = colorPalette[colorKey];
          const bgClass = cp ? `bg-gradient-to-br ${cp.bg}` : "bg-gray-300";
          const textClass = cp ? cp.text : "text-black";
          return (
            <div
              key={idx}
              className={`rounded-t-lg flex items-center justify-center font-bold ${bgClass} ${textClass}`}
              style={{
                width: `${width}px`,
                height: `${height}px`,
                marginBottom: idx < cake.expected.length - 1 ? `-${Math.round(height * 0.36)}px` : "0",
                border: "2px solid rgba(255,255,255,0.7)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.06)",
              }}
            >
              {colorKey[0].toUpperCase()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Main Component ---------- */
export default function M2SelectPlace({ onComplete, session, sessionApi }) {
  const [placed, setPlaced] = useState({});
  const [pieces, setPieces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 800);
  const [height, setHeight] = useState(typeof window !== "undefined" ? window.innerHeight : 600);
  const [allCakes, setAllCakes] = useState([]);
  const [slots, setSlots] = useState(equations);

  // We now rely on backend session timer; local states removed

  useEffect(() => {
    const resize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTrayClick = (cakeId) => {
    if (selected === cakeId) setSelected(null);
    else setSelected(cakeId);
  };

  const handleSlotClick = (slotId) => {
    const currentPlacedCake = placed[slotId];
    if (!selected) {
      if (!currentPlacedCake) return;
      setPlaced((prev) => {
        const next = { ...prev };
        delete next[slotId];
        return next;
      });
      setPieces((prev) => [...prev, currentPlacedCake]);
      setSelected(currentPlacedCake);
      return;
    }
    const cakeId = selected;
    setPlaced((prev) => {
      const newPlaced = { ...prev };
      const prevCake = prev[slotId];
      newPlaced[slotId] = cakeId;
      setPieces((prevPieces) => {
        let next = prevPieces.filter((p) => p !== cakeId);
        if (prevCake) next = [...next, prevCake];
        return next;
      });
      return newPlaced;
    });
    setSelected(null);
  };

  const checkAnswers = () => {
    let correctCount = 0;
    equations.forEach((eq) => {
      if (placed[eq.id] === eq.answer) {
        correctCount++;
      }
    });
    if (correctCount === equations.length) {
      setShowConfetti(true);
      onComplete && onComplete(true);
    } else {
      alert(`You got ${correctCount} out of ${equations.length} correct!`);
    }
  };


  const resetGame = () => {

    // create fresh slots
    const newSlots = equations.map((s) => ({ ...s }));
    const shuffled = [...equations].sort(() => Math.random() - 0.5);
    const newPlaced = {};
    const trayPieces = [];

    const firstSlotId = newSlots[0].id;
    const cake1 = shuffled[0];
    const modifiedCake1 = {
      ...cake1,
      id: cake1.id,
      expected: [cake1.expected[0], cake1.expected[0], cake1.expected[2]],
    };
    newPlaced[firstSlotId] = modifiedCake1.id;
    newSlots[0].total = computeCakeValue(modifiedCake1);

    const secondSlotId = newSlots[1].id;
    const cake2 = shuffled[1];
    const modifiedCake2 = {
      ...cake2,
      id: cake2.id,
      expected: [cake2.expected[0], cake2.expected[0], cake2.expected[2]],
    };
    newPlaced[secondSlotId] = modifiedCake2.id;
    newSlots[1].total = computeCakeValue(modifiedCake2);

    for (let i = 2; i < shuffled.length; i++) {
      trayPieces.push(shuffled[i].id);
    }
    const last = shuffled[shuffled.length - 1];
    const extraCake = { ...last, id: "extra-" + last.id };
    trayPieces.push(extraCake.id);

    setPlaced(newPlaced);
    setPieces(trayPieces);
    setAllCakes([modifiedCake1, modifiedCake2, ...shuffled.slice(2), extraCake]);
    setSlots(newSlots);
    setSelected(null);
    setShowConfetti(false);

  };

  // Auto-fail on timer expiry
  useEffect(() => {
    if (!session || session.completed) return;
    if (session.remainingSeconds === 0) {
      onComplete && onComplete(false);
    }
  }, [session, onComplete]);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-pink-50 to-blue-50">
      <div className="max-w-6xl mx-auto text-center mb-6">
        <h1 className="text-3xl font-bold">🎂 Cake Matching — Select & Place</h1>
        <p className="text-sm text-slate-600 mt-2">
          Click a cake in the tray, then click a slot to place it. Click a filled slot (with no selection) to pick it up.
        </p>
        <div className="mt-3 flex justify-center">
          <MinigameTimer remainingSeconds={session?.remainingSeconds ?? null} />
        </div>
      </div>

      {/* Slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-8">
        {slots.map((slot) => (
          <div
            key={slot.id}
            onClick={() => handleSlotClick(slot.id)}
            className={`bg-white/90 p-4 rounded-2xl shadow flex flex-col items-center justify-between min-h-[180px] cursor-pointer transition ${
              selected ? "hover:ring-2 hover:ring-blue-400" : ""
            }`}
          >
            <div className="w-full">
              <div className="text-sm font-semibold text-slate-700 mb-2 text-center">{slot.label}</div>
              {placed[slot.id] ? (
                <div className="flex items-center justify-center mb-3">
                  <CakeVisual cake={allCakes.find((c) => c.id === placed[slot.id])} />
                </div>
              ) : (
                <div className="h-[72px] mb-3 flex items-center justify-center text-gray-400">Empty</div>
              )}
              <div className="text-xs text-slate-600 text-center">
                Target: <span className="font-bold">{slot.total}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tray */}
      <div className="max-w-6xl mx-auto bg-white/80 p-4 rounded-2xl shadow mb-6">
        <div className="mb-3 text-sm font-medium text-slate-700 text-center">Tray — Click to select</div>
        <div className="flex flex-wrap gap-4 p-3 min-h-[84px] items-center justify-center">
          {pieces.map((id) => {
            const cake = allCakes.find((c) => c.id === id);
            return (
              <div
                key={id}
                onClick={() => handleTrayClick(id)}
                className={`p-2 rounded-lg cursor-pointer transition ${
                  selected === id ? "ring-2 ring-blue-400" : "hover:bg-gray-100"
                }`}
              >
                <CakeVisual cake={cake} small highlight={selected === id} />
                <div className="text-center text-xs mt-1">Value: {computeCakeValue(cake)}</div>
              </div>
            );
          })}
          {pieces.length === 0 && <div className="text-sm text-gray-500">No pieces in tray</div>}
        </div>
      </div>

      {/* Actions */}
      <div className="max-w-6xl mx-auto flex justify-center gap-4">
        <button
          onClick={checkAnswers}
          className="px-6 py-2 rounded-lg bg-emerald-500 text-white font-semibold shadow hover:bg-emerald-600"
        >
          Check Answers
        </button>
        <button
          onClick={resetGame}
          className="px-6 py-2 rounded-lg bg-gray-100 font-medium shadow hover:bg-gray-200 flex items-center gap-2"
        >
          <BsTrash /> Reset
        </button>
      </div>

      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 pointer-events-none z-50">
            <Confetti width={width} height={height} recycle={false} numberOfPieces={400} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
