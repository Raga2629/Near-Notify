import { useState, useEffect } from 'react';

export default function CountdownTimer({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) { setTimeLeft('Expired'); return; }
      const hours   = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setUrgent(hours < 2);
      if (hours >= 24) setTimeLeft(`${Math.floor(hours/24)}d left`);
      else if (hours > 0) setTimeLeft(`${hours}h ${minutes}m left`);
      else setTimeLeft(`${minutes}m left`);
    };
    calculate();
    const iv = setInterval(calculate, 60000);
    return () => clearInterval(iv);
  }, [expiresAt]);

  return (
    <span style={{
      fontSize: '11px', fontWeight: 500,
      color: timeLeft === 'Expired' ? '#9ca3af' : urgent ? '#ef4444' : '#6b7280',
      display: 'flex', alignItems: 'center', gap: '3px'
    }}>
      ⏱ {timeLeft}
    </span>
  );
}