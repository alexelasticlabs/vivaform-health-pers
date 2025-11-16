/**
 * Achievement Card Component
 * Displays achievements with progress and unlock animations
 */

import React from 'react';
import { Lock, Check } from 'lucide-react';
import { cn } from '@/lib/dashboard-utils';
import { getAchievementColor } from '@/lib/dashboard-utils';
import type { Achievement } from '@/types/dashboard.types';

interface AchievementCardProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  size = 'md',
  onClick,
  className,
}) => {
  const { title, description, icon, progress, unlocked, category, rarity, reward } = achievement;

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const iconSizes = {
    sm: 'h-8 w-8 text-2xl',
    md: 'h-12 w-12 text-3xl',
    lg: 'h-16 w-16 text-4xl',
  };

  const getRarityBorder = () => {
    switch (rarity) {
      case 'legendary':
        return 'border-2 border-amber-400 shadow-lg shadow-amber-500/50';
      case 'epic':
        return 'border-2 border-purple-400 shadow-lg shadow-purple-500/50';
      case 'rare':
        return 'border-2 border-blue-400 shadow-md shadow-blue-500/30';
      default:
        return 'border border-slate-200 dark:border-slate-800';
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'nutrition':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400';
      case 'hydration':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400';
      case 'activity':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400';
      case 'consistency':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400';
      case 'special':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-400';
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-white transition-all duration-300 dark:bg-slate-900',
        getRarityBorder(),
        onClick && 'cursor-pointer hover:scale-105',
        unlocked ? 'opacity-100' : 'opacity-60',
        sizeClasses[size],
        className
      )}
    >
      {/* Gradient background for unlocked achievements */}
      {unlocked && (
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-10',
            `bg-gradient-to-br ${getAchievementColor(rarity)}`
          )}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          {/* Icon */}
          <div
            className={cn(
              'flex items-center justify-center rounded-xl',
              unlocked ? 'bg-gradient-to-br ' + getAchievementColor(rarity) : 'bg-slate-200 dark:bg-slate-800',
              iconSizes[size]
            )}
          >
            {unlocked ? (
              <span className="filter drop-shadow-lg">{icon}</span>
            ) : (
              <Lock className="h-5 w-5 text-slate-400" />
            )}
          </div>

          {/* Status badge */}
          {unlocked ? (
            <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
              <Check className="h-3 w-3" />
              Unlocked
            </div>
          ) : (
            <div className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {progress}%
            </div>
          )}
        </div>

        {/* Title and description */}
        <div className="mb-3">
          <h4 className="mb-1 font-bold text-slate-900 dark:text-white">{title}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
        </div>

        {/* Progress bar (only for locked achievements) */}
        {!unlocked && (
          <div className="mb-3 space-y-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">{progress}% complete</p>
          </div>
        )}

        {/* Category and reward */}
        <div className="flex items-center justify-between gap-2">
          {/* Category badge */}
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold capitalize', getCategoryColor())}>
            {category}
          </span>

          {/* Reward info */}
          {reward && unlocked && (
            <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
              {reward.type === 'premium-trial' && '🎁 Premium Trial'}
              {reward.type === 'discount' && `💰 ${reward.value}% Off`}
              {reward.type === 'badge' && '🏅 Badge'}
              {reward.type === 'feature-unlock' && '🔓 Feature'}
            </div>
          )}
        </div>

        {/* Rarity indicator */}
        {rarity !== 'common' && (
          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: rarity === 'legendary' ? 5 : rarity === 'epic' ? 4 : 3 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 w-full rounded-full',
                  rarity === 'legendary' && 'bg-gradient-to-r from-amber-400 to-amber-600',
                  rarity === 'epic' && 'bg-gradient-to-r from-purple-400 to-purple-600',
                  rarity === 'rare' && 'bg-gradient-to-r from-blue-400 to-blue-600'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Unlock animation overlay */}
      {unlocked && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      )}

      {/* Sparkle effect for legendary */}
      {unlocked && rarity === 'legendary' && (
        <div className="absolute -right-2 -top-2 text-4xl animate-pulse">✨</div>
      )}
    </div>
  );
};

/**
 * Achievements Grid Component
 */
interface AchievementsGridProps {
  achievements: Achievement[];
  filter?: Achievement['category'] | 'all';
  onAchievementClick?: (achievement: Achievement) => void;
  className?: string;
}

export const AchievementsGrid: React.FC<AchievementsGridProps> = ({
  achievements,
  filter = 'all',
  onAchievementClick,
  className,
}) => {
  const filteredAchievements =
    filter === 'all' ? achievements : achievements.filter((a) => a.category === filter);

  // Sort: unlocked first, then by progress
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    return b.progress - a.progress;
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Achievements</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {unlockedCount} of {totalCount} unlocked
          </p>
        </div>

        {/* Overall progress */}
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-600">{Math.round((unlockedCount / totalCount) * 100)}%</div>
          <div className="text-xs text-slate-500">Complete</div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedAchievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            onClick={() => onAchievementClick?.(achievement)}
          />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/50">
          <p className="text-sm text-slate-500">No achievements in this category yet.</p>
        </div>
      )}
    </div>
  );
};
