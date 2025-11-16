/**
 * Streak Display Component
 * Shows current and longest streaks with visual flair
 */

import React from 'react';
import { Flame, Trophy, Calendar } from 'lucide-react';
import { cn } from '@/lib/dashboard-utils';
import { getStreakEmoji } from '@/lib/dashboard-utils';
import type { StreakData } from '@/types/dashboard.types';

interface StreakDisplayProps {
  streaks: StreakData[];
  featured?: boolean;
  className?: string;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({ streaks, featured = false, className }) => {
  // Find the longest current streak to feature
  const featuredStreak = streaks.reduce((max, streak) => (streak.current > max.current ? streak : max), streaks[0]);

  if (!featuredStreak) {
    return null;
  }

  const getStreakLabel = (type: StreakData['type']): string => {
    switch (type) {
      case 'daily-logging':
        return 'Daily Logging';
      case 'water-goal':
        return 'Hydration Goal';
      case 'calorie-goal':
        return 'Calorie Goal';
      case 'activity-goal':
        return 'Activity Goal';
      default:
        return 'Streak';
    }
  };

  if (featured) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-orange-50 to-red-50 p-6 dark:border-slate-800 dark:from-orange-950/20 dark:to-red-950/20',
          className
        )}
      >
        {/* Decorative background */}
        <div className="absolute right-0 top-0 -mr-12 -mt-12 h-32 w-32 rounded-full bg-gradient-to-br from-orange-400/20 to-red-400/20 blur-3xl" />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon and label */}
          <div className="mb-4 flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-600" />
            <span className="text-sm font-semibold text-orange-900 dark:text-orange-200">
              {getStreakLabel(featuredStreak.type)}
            </span>
          </div>

          {/* Current streak - big display */}
          <div className="mb-4 flex items-baseline gap-2">
            <span className="text-6xl font-bold text-orange-600">{featuredStreak.current}</span>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-orange-600">{getStreakEmoji(featuredStreak.current)}</span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">day streak</span>
            </div>
          </div>

          {/* Longest streak badge */}
          {featuredStreak.longest > featuredStreak.current && (
            <div className="inline-flex items-center gap-2 rounded-full bg-white/50 px-3 py-1.5 dark:bg-slate-900/50">
              <Trophy className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Best: {featuredStreak.longest} days
              </span>
            </div>
          )}

          {/* Personal record badge */}
          {featuredStreak.current === featuredStreak.longest && featuredStreak.current > 0 && (
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-white shadow-lg">
              <Trophy className="h-4 w-4" />
              <span className="text-xs font-bold">Personal Record! 🎉</span>
            </div>
          )}

          {/* Motivational message */}
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            {featuredStreak.current === 0 && "Start today! Build your streak one day at a time."}
            {featuredStreak.current > 0 && featuredStreak.current < 7 && "Keep going! You're building momentum!"}
            {featuredStreak.current >= 7 && featuredStreak.current < 30 && "Amazing! You're on fire! 🔥"}
            {featuredStreak.current >= 30 && "Incredible dedication! You're unstoppable! 🏆"}
          </p>
        </div>
      </div>
    );
  }

  // Compact view - show all streaks
  return (
    <div className={cn('space-y-2', className)}>
      {streaks.map((streak) => (
        <div
          key={streak.type}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Left side - type and current */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/30">
              <Flame className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{getStreakLabel(streak.type)}</div>
              <div className="text-xs text-slate-500">
                {streak.current > 0 ? `${streak.current} days` : 'Start today!'}
              </div>
            </div>
          </div>

          {/* Right side - emoji and best */}
          <div className="flex items-center gap-3">
            {streak.longest > streak.current && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Trophy className="h-3 w-3" />
                <span>Best: {streak.longest}</span>
              </div>
            )}
            <span className="text-2xl">{getStreakEmoji(streak.current)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
