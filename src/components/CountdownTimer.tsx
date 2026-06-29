import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface Props {
  deadline: number;
  status: string;
}

export default function CountdownTimer({ deadline, status }: Props) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    if (status === 'completed' || status === 'pending_approval') {
      return;
    }

    const calculateTime = () => {
      const now = Date.now();
      const diff = deadline - now;
      
      if (diff <= 0) {
        setIsOverdue(true);
        setTimeLeft('Quá hạn');
        return;
      }

      setIsOverdue(false);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`Còn ${days} ngày ${hours} giờ`);
      } else if (hours > 0) {
        setTimeLeft(`Còn ${hours} giờ ${minutes} phút`);
      } else {
        setTimeLeft(`Còn ${minutes} phút`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [deadline, status]);

  if (status === 'completed') return null;
  if (status === 'pending_approval') return null;

  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border ${isOverdue ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
      <Clock size={12}/> {timeLeft}
    </span>
  );
}
