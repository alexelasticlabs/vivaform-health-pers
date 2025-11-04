import clsx from 'clsx';

interface OptionTileProps {
  title: string;
  description?: string;
  emoji?: string;
  selected?: boolean;
  onClick: () => void;
  className?: string;
  'aria-label'?: string;
}

export function OptionTile({ title, description, emoji, selected, onClick, className, ...rest }: OptionTileProps) {
  return (
    <button
      type="button"
      role="button"
      aria-pressed={!!selected}
      onClick={onClick}
      className={clsx(
        'w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2',
        selected
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-md'
          : 'border-border bg-card hover:bg-card-hover',
        className,
      )}
      {...rest}
    >
      <div className="flex items-start gap-3">
        {emoji && <span className="text-2xl">{emoji}</span>}
        <div className="flex-1">
          <div className="font-semibold text-foreground">{title}</div>
          {description && <div className="mt-1 text-sm text-muted-foreground">{description}</div>}
        </div>
        {selected && (
          <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </button>
  );
}
