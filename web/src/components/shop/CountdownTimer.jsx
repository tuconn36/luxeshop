import React, { useState, useEffect } from 'react';

export default function CountdownTimer({ endTime, onEnd }) {
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft());

  function calcTimeLeft() {
    const diff = new Date(endTime) - new Date();
    if (diff <= 0) return null;
    return {
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const t = calcTimeLeft();
      setTimeLeft(t);
      if (!t && onEnd) onEnd();
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  if (!timeLeft) return <span className="text-sm font-mono text-red-600">Đã kết thúc</span>;

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5">
      {[
        { value: timeLeft.hours, label: 'GIỜ' },
        { value: timeLeft.minutes, label: 'PHÚT' },
        { value: timeLeft.seconds, label: 'GIÂY' },
      ].map(({ value, label }, i) => (
        <React.Fragment key={label}>
          {i > 0 && <span className="text-red-500 font-bold text-lg">:</span>}
          <div className="flex flex-col items-center bg-red-600 text-white rounded-lg w-12 py-1.5">
            <span className="text-xl font-mono font-bold leading-none">{pad(value)}</span>
            <span className="text-[9px] font-semibold tracking-wider mt-0.5">{label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
