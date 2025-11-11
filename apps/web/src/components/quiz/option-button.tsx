import type { ReactNode } from 'react';

interface OptionButtonProps {
  label?: string;
  description?: string;
  emoji?: string;
  selected?: boolean;
  onClick: () => void;
  children?: ReactNode;
  className?: string;
}

export function OptionButton({
  label,
  description,
  emoji,
  selected,
  onClick,
  children,
  className = '',
}: OptionButtonProps) {
  const content = children || label;
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02] ${
        selected
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-md'
          : 'border-border bg-card hover:bg-card-hover'
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        {emoji && <span className="text-2xl flex-shrink-0">{emoji}</span>}
        <div className="flex-1">
          <div
            className={`font-semibold ${selected ? 'text-foreground' : 'text-foreground'}`}
          >
            {content}
          </div>
          {description && (
            <div
              className={`text-sm mt-1 ${selected ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'}`}
            >
              {description}
            </div>
          )}
        </div>
        {selected && (
          <svg
            className="w-6 h-6 text-emerald-500 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    </button>
  );
}
