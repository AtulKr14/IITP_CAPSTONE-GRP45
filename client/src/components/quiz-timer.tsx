import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface QuizTimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  onTimeSpent: (timeSpent: number) => void;
  isActive: boolean;
  reset?: boolean;
}

export function QuizTimer({ duration, onTimeUp, onTimeSpent, isActive, reset }: QuizTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    if (reset) {
      setTimeRemaining(duration);
      setStartTime(Date.now());
    }
  }, [reset, duration]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          const timeSpent = Math.round((Date.now() - startTime) / 1000);
          onTimeSpent(timeSpent);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp, onTimeSpent, startTime]);

  // Report time spent when component unmounts or question changes
  useEffect(() => {
    return () => {
      if (timeRemaining < duration) {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        onTimeSpent(timeSpent);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = (timeRemaining / duration) * 100;
  const getTimerColor = () => {
    if (timeRemaining <= 10) return 'bg-red-500';
    if (timeRemaining <= 20) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">Time Remaining</p>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-primary" />
          <p className={`text-2xl font-bold ${timeRemaining <= 10 ? 'text-red-500' : 'text-primary'}`}>
            {formatTime(timeRemaining)}
          </p>
        </div>
      </div>
      
      <div className="w-full max-w-xs ml-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${getTimerColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
