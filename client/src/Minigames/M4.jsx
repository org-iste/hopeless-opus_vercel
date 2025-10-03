import React, { useState, useEffect, useRef } from "react";
import MinigameTimer from "../components/MinigameTimer";

// ConcentricToggleGame.jsx
// Game using only JavaScript, React and Tailwind CSS

const SEGMENTS = 8; // 4 lines -> 8 sectors
const TAU = Math.PI * 2;

function polarToCartesian(cx, cy, r, angleRad) {
  return [cx + r * Math.cos(angleRad), cy + r * Math.sin(angleRad)];
}

function sectorPath(cx, cy, r1, r2, startAngle, endAngle) {
  const [x1, y1] = polarToCartesian(cx, cy, r2, startAngle);
  const [x2, y2] = polarToCartesian(cx, cy, r2, endAngle);
  const [x3, y3] = polarToCartesian(cx, cy, r1, endAngle);
  const [x4, y4] = polarToCartesian(cx, cy, r1, startAngle);

  const largeArc = endAngle - startAngle <= Math.PI ? "0" : "1";

  return `M ${x1} ${y1} A ${r2} ${r2} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${r1} ${r1} 0 ${largeArc} 0 ${x4} ${y4} Z`;
}

export default function ConcentricToggleGame({ onComplete, session, sessionApi }) {
    // Outer: sectors 1, 4, and 6 colored
    const [outer, setOuter] = useState(() => {
        const arr = Array(SEGMENTS).fill(false);
        arr[1] = true;
        arr[4] = true;
        arr[6] = true;
        return arr;
    });

    // Inner: sectors 1 and 6 colored
    const [inner, setInner] = useState(() => {
        const arr = Array(SEGMENTS).fill(false);
        arr[1] = true;
        arr[6] = true;
        return arr;
    });

    // Token starts at outer ring, index 4
    const [token, setToken] = useState({ ring: "outer", idx: 4 });

  function toggleSegment(ring, idx) {
    if (ring === "outer") {
      setOuter((prev) => prev.map((val, i) => (i === idx ? !val : val)));
    } else {
      setInner((prev) => prev.map((val, i) => (i === idx ? !val : val)));
    }
  }

    function autoMove() {
  let current = { ...token };
  for (let step = 0; step < 3; step++) {
    current.idx = (current.idx + 1) % SEGMENTS;
  }
  setToken(current);
  toggleSegment(current.ring, current.idx);

  setTimeout(() => {
    if (checkWin(outer, inner)) setWinner(true);
  }, 0);
}

    function doSwitch() {
        const idx = token.idx;
        if (token.ring === "outer") {
            setInner((prev) => {
                const newInner = prev.map((val, i) => (i === idx ? !val : val));
                if (checkWin(outer, newInner)) setWinner(true);
                return newInner;
            });
            setToken({ ring: "inner", idx });
        } else {
            setOuter((prev) => {
                const newOuter = prev.map((val, i) => (i === idx ? !val : val));
                if (checkWin(newOuter, inner)) setWinner(true);
                return newOuter;
            });
            setToken({ ring: "outer", idx });
        }
    }

  function autoMove() {
    let current = { ...token };
    for (let step = 0; step < 3; step++) {
      // simple rule: move clockwise in same ring (outer only)
      current.idx = (current.idx + 1) % SEGMENTS;
    }
    setToken(current);
    toggleSegment(current.ring, current.idx);
  }

  const size = 400;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 180;
  const innerR = 80;
  const [winner, setWinner] = useState(false);

    function checkWin(outer, inner) {
        return outer.every(Boolean) && inner.every(Boolean);
    }
  const sectors = Array.from({ length: SEGMENTS }, (_, i) => {
    const startAngle = (i * TAU) / SEGMENTS - Math.PI / 2;
    const endAngle = ((i + 1) * TAU) / SEGMENTS - Math.PI / 2;
    return {
      pathOuter: sectorPath(cx, cy, innerR, outerR, startAngle, endAngle),
      pathInner: sectorPath(cx, cy, 0, innerR, startAngle, endAngle),
      startAngle,
      endAngle,
    };
  });

    function tokenCoords(ring, idx) {
        const sector = sectors[idx];
        const angle = (sector.startAngle + sector.endAngle) / 2;

        let r;
        if (ring === "outer") {
            r = (innerR + outerR) / 2; // middle of outer ring
        } else {
            r = innerR / 2; // middle of inner ring
        }

        return polarToCartesian(cx, cy, r, angle);
    }

    async function resetGame() {
        // Decrement a try on reset if we still have tries and session API available
        if (session?.triesLeft > 0 && sessionApi?.decrementTry) {
          try {
            await sessionApi.decrementTry();
          } catch (e) {
            // Non-fatal; log only
            console.warn('Failed to decrement try on reset', e);
          }
        }
        // Reset outer ring: sectors 1, 4, and 6 colored
        setOuter(() => {
            const arr = Array(SEGMENTS).fill(false);
            arr[1] = true;
            arr[4] = true;
            arr[6] = true;
            return arr;
        });

        // Reset inner ring: sectors 1 and 6 colored
        setInner(() => {
            const arr = Array(SEGMENTS).fill(false);
            arr[1] = true;
            arr[6] = true;
            return arr;
        });

        // Reset token to outer ring, index 4
        setToken({ ring: "outer", idx: 4 });

        // Reset winner flag
        setWinner(false);
    }

  const failedRef = useRef(false);
  // Fail on expiry or triesLeft depletion (triesLeft from session for M4)
  useEffect(() => {
    if (!session || session.completed || failedRef.current) return;
    if (session.remainingSeconds === 0) {
      failedRef.current = true;
      onComplete && onComplete(false);
    }
    if (typeof session.triesLeft === 'number' && session.triesLeft <= 0) {
      failedRef.current = true;
      onComplete && onComplete(false);
    }
  }, [session, onComplete]);

  // When player wins, notify backend complete
  useEffect(() => {
    if (winner && !failedRef.current) {
      failedRef.current = true;
      onComplete && onComplete(true);
    }
  }, [winner, onComplete]);

  return (
    <div className="p-6 min-h-screen bg-gray-50 flex flex-col items-center gap-6">
      <MinigameTimer remainingSeconds={session?.remainingSeconds ?? null} triesLeft={session?.triesLeft ?? null} />
      <h1 className="text-xl font-bold">Concentric Toggle Game</h1>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {sectors.map((s, i) => (
          <path
            key={`outer-${i}`}
            d={s.pathOuter}
            fill={outer[i] ? "#60A5FA" : "white"}
            stroke="black"
          />
        ))}
        {sectors.map((s, i) => (
          <path
            key={`inner-${i}`}
            d={s.pathInner}
            fill={inner[i] ? "#34D399" : "white"}
            stroke="black"
          />
        ))}
        {/* Lines */}
        <line x1={cx - outerR} y1={cy} x2={cx + outerR} y2={cy} stroke="black" />
        <line x1={cx} y1={cy - outerR} x2={cx} y2={cy + outerR} stroke="black" />
        <line
          x1={cx - outerR * Math.SQRT1_2}
          y1={cy - outerR * Math.SQRT1_2}
          x2={cx + outerR * Math.SQRT1_2}
          y2={cy + outerR * Math.SQRT1_2}
          stroke="black"
        />
        <line
          x1={cx - outerR * Math.SQRT1_2}
          y1={cy + outerR * Math.SQRT1_2}
          x2={cx + outerR * Math.SQRT1_2}
          y2={cy - outerR * Math.SQRT1_2}
          stroke="black"
        />
        {/* Token */}
        {(() => {
          const [tx, ty] = tokenCoords(token.ring, token.idx);
          return (
            <text x={tx} y={ty + 5} textAnchor="middle" fontSize="20">
              *
            </text>
          );
        })()}
      </svg>

      <div className="flex gap-2">
        <button
          className="px-3 py-2 bg-blue-500 text-white rounded"
          onClick={autoMove}
        >
          Move (3 steps clockwise)
        </button>
        <button
          className="px-3 py-2 bg-green-500 text-white rounded"
          onClick={doSwitch}
        >
          Switch
        </button>
        <button
          className="px-3 py-2 bg-red-500 text-white rounded"
          onClick={resetGame}
          disabled={session?.triesLeft !== null && session?.triesLeft <= 0}
        >
          {session?.triesLeft !== null && session?.triesLeft <= 0 ? 'No Tries' : 'Reset'}
        </button>
      </div>

          {winner && (
              <div className="mt-4 text-2xl font-bold text-green-600">
                  🎉 You Won! 🎉
              </div>
          )}
    </div>
  );
}