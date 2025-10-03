// ============================================
// M6.jsx - Cipher Riddle Game with Timer & Wrong Answer Counter
// ============================================
import React, { useState, useEffect, useRef, useCallback } from "react";
import MinigameTimer from "../components/MinigameTimer";
import backgroundImage from "../assets/cipherimage.jpg";

export default function M6({ config, onComplete, session, sessionApi }) {
  const cipherText = "Zvuv Whgga Xbhzap Vvthup";
  const correctAnswer = "theseromansarecrazy";
  const TIMER_DURATION_MINUTES = 2; // Customize timer here

  const [input, setInput] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);

  // --- Timer Setup ---
  const totalTimeMs = TIMER_DURATION_MINUTES * 60 * 1000;
  const [timeRemainingMs, setTimeRemainingMs] = useState(totalTimeMs);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const timerRef = useRef(null);

  const initializeTimer = useCallback(() => {
    const storedStartTime = localStorage.getItem("m6StartTime");
    const currentTime = Date.now();

    if (!storedStartTime) {
      localStorage.setItem("m6StartTime", currentTime);
      setTimeRemainingMs(totalTimeMs);
      setIsTimeUp(false);
      return totalTimeMs;
    } else {
      const elapsed = currentTime - Number(storedStartTime);
      const remaining = totalTimeMs - elapsed;
      if (remaining <= 0) {
        setTimeRemainingMs(0);
        setIsTimeUp(true);
        setGameEnded(true);
        return 0;
      } else {
        setTimeRemainingMs(remaining);
        setIsTimeUp(false);
        return remaining;
      }
    }
  }, [totalTimeMs]);

  useEffect(() => {
    const initialRemaining = initializeTimer();

    if (initialRemaining > 0) {
      timerRef.current = setInterval(() => {
        const storedStartTime = Number(localStorage.getItem("m6StartTime"));
        const elapsed = Date.now() - storedStartTime;
        const remaining = totalTimeMs - elapsed;

        if (remaining <= 0) {
          clearInterval(timerRef.current);
          setTimeRemainingMs(0);
          setIsTimeUp(true);
          setGameEnded(true);
        } else {
          setTimeRemainingMs(remaining);
        }
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [initializeTimer, totalTimeMs]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

 // --- Handle Submission ---
const handleSubmit = () => {
  if (gameEnded) return; // Stop submitting after game ends

  setSubmitted(true);
  if (input.toLowerCase().replace(/\s+/g, "") === correctAnswer) {
    setIsCorrect(true);
    setGameEnded(true); // End the game immediately
    clearInterval(timerRef.current); // ⬅️ Stop the timer
    if (onComplete) {
      setTimeout(() => onComplete(true), 1000);
    }
  } else {
    setIsCorrect(false);
    setWrongCount((prev) => prev + 1);
  }
};


  // Session integration for expiry and tries decrement on wrong attempts
  useEffect(() => {
    if (!session || session.completed) return;
    if (session.remainingSeconds === 0) {
      setGameEnded(true);
      onComplete && onComplete(false);
    }
    if (typeof session.triesLeft === 'number' && session.triesLeft <= 0) {
      setGameEnded(true);
      onComplete && onComplete(false);
    }
  }, [session, onComplete]);

  useEffect(() => {
    if (wrongCount > 0 && !isCorrect && sessionApi?.decrementTry) {
      sessionApi.decrementTry();
    }
  }, [wrongCount, isCorrect, sessionApi]);

  return (
    <div
      className="min-h-screen relative font-serif"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "'IM Fell English', serif",
      }}
    >
      <div className="absolute inset-0"></div>

      {/* --- Timer Display Top-Left --- */}
      <div className="absolute top-4 left-4">
        <MinigameTimer remainingSeconds={session?.remainingSeconds ?? Math.floor(timeRemainingMs/1000)} triesLeft={session?.triesLeft ?? null} />
      </div>

      {/* --- Wrong Answer Counter --- */}
      <div
        className="absolute top-16 left-4 text-lg font-semibold p-2 rounded-lg"
        style={{
          backgroundColor: "rgba(255,255,255,0.7)",
          color: "#9b111e",
          border: "2px solid #5c0000",
        }}
      >
        Wrong Attempts: {wrongCount}
      </div>

      <input
        type="text"
        placeholder="Enter your answer"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={gameEnded}
        className="absolute top-[50%] left-[57%] p-3 rounded-lg w-[20%] border border-[#a07855] focus:outline-none focus:ring-2 focus:ring-[#a07855] focus:border-[#a07855] shadow-md"
        style={{ color: "#8B0000" }}
      />

      <button
        onClick={handleSubmit}
        disabled={gameEnded}
        className="absolute top-[60%] left-[63.5%] px-6 py-3 rounded-lg bg-[#551414ff] hover:bg-[#432c09ff] text-[#f5f0e1] font-semibold transition shadow-[0_10px_25px_rgba(85,20,20,0.7)"
      >
        Write
      </button>

      {/* --- Messages --- */}
      {gameEnded && isCorrect && (
        <p
          className="absolute top-[70%] left-[54.5%] text-2xl font-bold animate-pulse"
          style={{
            color: "#551414ff",
            textShadow: "0 0 10px rgba(65, 35, 35, 0.8)",
          }}
        >
          Congratulations, the veil is lifted.
        </p>
      )}
      {gameEnded && isTimeUp && !isCorrect && (
        <p
          className="absolute top-[70%] left-[52.5%] text-2xl font-bold animate-pulse"
          style={{
            color: "#7B3F00",
            textShadow: "0 0 10px rgba(65, 35, 35, 0.8)",
          }}
        >
          Time's up! The riddle remains sealed.
        </p>
      )}
      {!gameEnded && submitted && !isCorrect && (
        <p
          className="absolute top-[70%] left-[52.5%] text-lg"
          style={{
            color: "#3f1010ff",
          }}
        >
          The riddle remains sealed. Return with sharper eyes.
        </p>
      )}
    </div>
  );
}
