import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface OptionPillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  selected?: boolean;
  className?: string;
}

export function OptionPill({ children, selected, className, ...rest }: OptionPillProps) {
  return (
    <button
      type="button"
      aria-pressed={!!selected}
      {...rest}
      className={clsx(
        'inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2',
        selected
          ? 'border-emerald-500 bg-emerald-50 text-foreground dark:bg-emerald-900/20'
          : 'border-border bg-card hover:bg-card-hover',
        className,
      )}
    >
      {children}
    </button>
  );
}
