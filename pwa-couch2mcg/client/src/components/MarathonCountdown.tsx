import { useEffect, useState } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, parseISO } from 'date-fns';

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const MarathonCountdown = () => {
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const RACE_DATE = parseISO('2026-10-11');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const totalSeconds = Math.floor((RACE_DATE.getTime() - now.getTime()) / 1000);

      if (totalSeconds <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(totalSeconds / (24 * 60 * 60));
      const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
      const seconds = totalSeconds % 60;

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-6 text-center">
      <h3 className="text-lg font-bold text-foreground mb-2">Melbourne Marathon 2026</h3>
      <p className="text-sm text-muted-foreground mb-4">October 11, 2026</p>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-primary">{countdown.days}</div>
          <div className="text-xs text-muted-foreground font-semibold">DAYS</div>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-primary">{countdown.hours}</div>
          <div className="text-xs text-muted-foreground font-semibold">HOURS</div>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-primary">{countdown.minutes}</div>
          <div className="text-xs text-muted-foreground font-semibold">MINS</div>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-primary">{countdown.seconds}</div>
          <div className="text-xs text-muted-foreground font-semibold">SECS</div>
        </div>
      </div>
    </div>
  );
};
