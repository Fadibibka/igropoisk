import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type CountdownTimerProps = {
  targetDate: string;
};

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = { days: 0, hours: 0, minutes: 0 };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-8 justify-self-end self-end items-center text-white text-xl font-bold">
      <div className="text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={timeLeft.days}
            className="text-6xl"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {timeLeft.days}
          </motion.p>
        </AnimatePresence>
        <span className="text-xs text-white">ДНЕЙ</span>
      </div>

      <div className="w-px h-32 bg-white" />

      <div className="text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={timeLeft.hours}
            className="text-6xl"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {timeLeft.hours}
          </motion.p>
        </AnimatePresence>
        <span className="text-xs text-white">ЧАСОВ</span>
      </div>

      <div className="w-px h-32 bg-white" />

      <div className="text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={timeLeft.minutes}
            className="text-6xl"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {timeLeft.minutes}
          </motion.p>
        </AnimatePresence>
        <span className="text-xs text-white">МИНУТ</span>
      </div>
    </div>
  );
}
