import React, { useState, useEffect } from "react";

const Countdown = ({ targetDateProp }) => {
  const [time, setTime] = useState(0);

  const targetDate = targetDateProp || new Date("2025-10-08T00:00:00");

  useEffect(() => {
    const updateTimer = () => {
      const currentTime = new Date().getTime();
      const targetTime = targetDate.getTime();
      const timeDiff = targetTime - currentTime;
      setTime(Math.max(timeDiff, 0));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const formatTime = (time) => {
    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  const { days, hours, minutes, seconds } = formatTime(time);

  const unitBlock = (value, label) => (
    <div
      className="relative flex items-center justify-center
                 backdrop-blur-xs bg-[#000000]/20
                 w-16 sm:w-28 md:w-32 lg:w-36
                 h-20 sm:h-28 md:h-32 lg:h-36
                 rounded-lg shadow-lg px-2"
    >
      {/* Number moved slightly up using absolute positioning */}
      <div
        className="absolute top-2 sm:top-3 md:top-4 lg:top-5 w-full text-white font-mono
                   text-2xl sm:text-4xl md:text-6xl lg:text-7xl flex justify-center"
      >
        {value.toString().padStart(2, "0")}
      </div>

      {/* Label remains in the same position */}
      <div
        className="absolute bottom-4 text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 text-center w-full"
      >
        {label}
      </div>
    </div>
  );

  const colon = (
    <div className="text-white font-mono text-2xl sm:text-4xl md:text-6xl lg:text-7xl mx-1 sm:mx-2.5 flex items-center justify-center select-none">
      :
    </div>
  );

  return (
    <div className="w-full flex justify-center items-center min-h-[60vh] px-4">
      <div className="flex flex-nowrap sm:flex-wrap justify-center gap-3 sm:gap-6 md:gap-7 lg:gap-6 overflow-x-auto">
        {unitBlock(days, "Days")}
        {colon}
        {unitBlock(hours, "Hours")}
        {colon}
        {unitBlock(minutes, "Minutes")}
        {colon}
        {unitBlock(seconds, "Seconds")}
      </div>
    </div>
  );
};

export default Countdown;
