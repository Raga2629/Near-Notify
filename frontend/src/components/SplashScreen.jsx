import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1500);
    const t3 = setTimeout(() => setPhase(3), 2800);
    const t4 = setTimeout(() => onDone(), 4500); // Now stays for 4.5 seconds
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
         style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #0F2447 100%)' }}>

      {/* Logo */}
      <div className={`flex flex-col items-center transition-all duration-500 ${
        phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
        <div className="relative mb-4">
          <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center 
                          justify-center shadow-2xl">
            <MapPin size={40} color="white" strokeWidth={2.5} />
          </div>
          {/* Pulse ring */}
          <div className={`absolute inset-0 rounded-3xl border-2 border-orange-400
                          transition-all duration-700 ${
            phase >= 2 ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
          }`} />
        </div>

        <h1 className="text-white text-3xl font-bold tracking-tight">
          NearNotify
        </h1>
        <p className="text-blue-200 text-sm mt-1">
          Hyperlocal Smart Notice Board
        </p>
      </div>

      {/* Loading dots */}
      <div className={`flex gap-2 mt-12 transition-all duration-500 ${
        phase >= 2 ? 'opacity-100' : 'opacity-0'
      }`}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-orange-400 rounded-full"
            style={{
              animation: phase >= 2 ? `bounce 0.8s ease-in-out ${i * 0.15}s infinite` : 'none'
            }}
          />
        ))}
      </div>

      {/* Tagline */}
      <p className={`text-blue-300 text-xs mt-6 transition-all duration-500 ${
        phase >= 3 ? 'opacity-100' : 'opacity-0'
      }`}>
        Discovering what's near you...
      </p>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}