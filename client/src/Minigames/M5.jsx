// ============================================
// M5.jsx - Morse Code Game (3 attempts, total 90s, persistent tries, tamper-proof)
// ============================================
import React, { useState, useEffect, useRef } from "react";
import MinigameTimer from "../components/MinigameTimer";
import morseAudio from "../assets/morse.wav";
import morseBg from "../assets/morse.png";

const TOTAL_TIME = 90; // total game time in seconds
const MAX_TRIES = 3;

const M5 = ({ config, onComplete, session, sessionApi }) => {
  const audioRef = useRef(null);
  const objectUrlRef = useRef(null);

  // Initialize triesLeft from localStorage
  const getInitialTries = () => { 
    const storedTries = localStorage.getItem("morseTriesLeft");
    if (storedTries !== null) {
      return parseInt(storedTries, 10);
    }
    localStorage.setItem("morseTriesLeft", MAX_TRIES);
    return MAX_TRIES;
  };

  // Initialize total timeLeft from localStorage
  const getInitialTime = () => {
    let endTime = localStorage.getItem("morseEndTime");
    if (!endTime) {
      endTime = Date.now() + TOTAL_TIME * 1000;
      localStorage.setItem("morseEndTime", endTime);
    }
    return Math.max(0, Math.floor((parseInt(endTime, 10) - Date.now()) / 1000));
  };

  // Check if tampering has occurred
  const [tampered, setTampered] = useState(() => {
    return localStorage.getItem("morseTampered") === "true";
  });

  const [timeLeft, setTimeLeft] = useState(getInitialTime());
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(tampered);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [triesLeft, setTriesLeft] = useState(getInitialTries);

  // Immediately enforce tampering if detected
  useEffect(() => {
    if (tampered) {
      setMessage("GAME OVER - TAMPERING DETECTED");
      setGameOver(true);
      if (audioRef.current) audioRef.current.pause();
    }
  }, [tampered]);

  // Timer effect
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      const endTime = parseInt(localStorage.getItem("morseEndTime"), 10);
      const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(diff);

      if (diff <= 0) {
        clearInterval(interval);
        setMessage("ACCESS DENIED");
        setGameOver(true);
        if (audioRef.current) audioRef.current.pause();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameOver]);

  // Detect localStorage tampering
  useEffect(() => {
    const checkTampering = () => {
      const storedTries = parseInt(localStorage.getItem("morseTriesLeft") || "0", 10);
      const endTime = parseInt(localStorage.getItem("morseEndTime") || "0", 10);
      if (storedTries > MAX_TRIES || endTime > Date.now() + TOTAL_TIME * 1000) {
        return true;
      }
      return false;
    };

    const tamperInterval = setInterval(() => {
      if (checkTampering() && !gameOver) {
        localStorage.setItem("morseTampered", "true"); // mark permanently
        setTampered(true);
        setMessage("ACCESS DENIED - TAMPERING DETECTED");
        setGameOver(true);
        if (audioRef.current) audioRef.current.pause();
        clearInterval(tamperInterval);
      }
    }, 1000);

    return () => clearInterval(tamperInterval);
  }, [gameOver]);

  const handleFail = () => {
    const remaining = triesLeft - 1;
    localStorage.setItem("morseTriesLeft", remaining);
    if (remaining > 0) {
      setTriesLeft(remaining);
      setMessage("ACCESS DENIED");
      setInput("");
    } else {
      setTriesLeft(0);
      setMessage("ACCESS DENIED - GAME OVER"); //  updated message
      setGameOver(true);
      if (audioRef.current) audioRef.current.pause();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (gameOver) return;

    if (input.trim().toLowerCase() === "unlock") {
      setMessage("ACCESS GRANTED");
      setGameOver(true);
      if (audioRef.current) audioRef.current.pause();
      if (onComplete) setTimeout(() => onComplete(true), 2000);
    } else {
      handleFail();
    }
  };

  const handleToggleMorse = async () => {
    if (!audioRef.current) {
      try {
        const resp = await fetch(morseAudio, { cache: "no-store" });
        const arrayBuffer = await resp.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;

        const audioEl = new Audio();
        audioEl.src = url;
        audioEl.loop = true;
        audioRef.current = audioEl;
      } catch (err) {
        console.error("Audio setup failed:", err);
        return;
      }
    }

    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setAudioPlaying(true);
      } catch (err) {
        console.error("Audio playback failed:", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  // Session-driven expiry / tries
  useEffect(() => {
    if (!session || session.completed) return;
    if (session.remainingSeconds === 0) {
      onComplete && onComplete(false);
    }
    if (typeof session.triesLeft === 'number' && session.triesLeft <= 0) {
      onComplete && onComplete(false);
    }
  }, [session, onComplete]);

  const failAndDecrement = () => {
    if (sessionApi?.decrementTry) sessionApi.decrementTry();
    handleFail();
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-black bg-cover bg-center"
      style={{ backgroundImage: `url(${morseBg})` }}
    >
      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <MinigameTimer remainingSeconds={session?.remainingSeconds ?? timeLeft} triesLeft={session?.triesLeft ?? triesLeft} />
      </div>

      <div className="absolute top-[50%] left-[47%] transform -translate-x-1/2 flex items-center gap-3">
        <button
          onClick={handleToggleMorse}
          disabled={gameOver}
          className={`px-4 py-2 rounded-md transition duration-300 ease-in-out shadow-md hover:scale-105 cursor-pointer
                      ${gameOver ? "bg-gray-600 text-gray-300 cursor-not-allowed" : "bg-gray-800 hover:bg-gray-700 text-white"}`}
        >
          {audioPlaying ? "❚❚" : "▶︎"}
        </button>

        <input
          type="text"
          placeholder="Enter the override code..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={gameOver}
          className="px-4 py-2 rounded-md bg-neutral-900 border border-gray-600 text-white 
                     placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />

        <button
          type="submit"
          onClick={handleSubmit}
          disabled={gameOver}
          className="px-6 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-white 
                     transition duration-300 ease-in-out shadow-md hover:scale-105 cursor-pointer"
        >
          Enter
        </button>
        {!gameOver && (
          <button
            type="button"
            onClick={failAndDecrement}
            className="ml-3 px-4 py-2 rounded-md bg-red-700 hover:bg-red-600 text-white text-sm"
          >
            Fail Attempt
          </button>
        )}
      </div>

      <p
        className={`absolute top-[32%] left-[44%] transform -translate-x-1/2 text-xl font-bold ${
          message.includes("GRANTED") ? "text-[#2f6602]" : "text-[#731005]"
        }`}
      >
        {message}
      </p>
    </div>
  );
};

export default M5;
