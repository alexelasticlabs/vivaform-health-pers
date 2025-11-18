import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface BadgeUnlockProps {
  badge: {
    emoji: string;
    name: string;
    description: string;
  };
  onClose: () => void;
}

const MDiv = motion.div as any;

export function BadgeUnlock({ badge, onClose }: BadgeUnlockProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <MDiv
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="bg-gradient-to-br from-emerald-500 to-blue-600 text-white rounded-2xl p-6 shadow-2xl pointer-events-auto max-w-sm"
      >
        <div className="text-center">
          <MDiv
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: 2,
            }}
            className="text-6xl mb-3"
          >
            {badge.emoji}
          </MDiv>
          <h3 className="text-xl font-bold mb-1">Badge Unlocked!</h3>
          <p className="text-lg font-semibold mb-1">{badge.name}</p>
          <p className="text-sm opacity-90">{badge.description}</p>
        </div>

        {/* Confetti particles */}
        {[...Array(12)].map((_, i) => (
          <MDiv
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'][i % 4],
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: Math.cos((i * 30 * Math.PI) / 180) * 100,
              y: Math.sin((i * 30 * Math.PI) / 180) * 100,
              opacity: 0,
              scale: [1, 1.5, 0],
            }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        ))}
      </MDiv>
    </div>
  );
}

