import React from 'react';
import clsx from 'clsx';

// Базовый прямоугольный skeleton
export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement> & { width?: number | string; height?: number | string; radius?: number | string } > = ({
  className,
  width = '100%',
  height = 16,
  radius = 8,
  style,
  ...rest
}) => {
  return (
    <div
      className={clsx('animate-pulse bg-neutral-200 dark:bg-neutral-700', className)}
      style={{ width, height, borderRadius: radius, ...style }}
      {...rest}
    />
  );
};

// Набор скелетонов для страницы: хедер + карточки / текст
export const PageSkeleton: React.FC<{ lines?: number }> = ({ lines = 5 }) => {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <Skeleton height={34} width={220} radius={10} />
        <Skeleton height={18} width={300} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4">
            <Skeleton height={20} width="60%" />
            <Skeleton height={12} width="80%" />
            <Skeleton height={12} width="70%" />
            <Skeleton height={12} width="90%" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} height={14} width={`${90 - i * 5}%`} />
        ))}
      </div>
    </div>
  );
};

