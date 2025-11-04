import clsx from 'clsx';

interface ChoiceToggleProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
}

export function ChoiceToggle({ label, selected, onClick }: ChoiceToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!selected}
      onClick={onClick}
      className={clsx(
        'flex w-full items-center justify-between rounded-xl border p-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2',
        selected ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-border bg-card hover:bg-card-hover'
      )}
    >
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span
        aria-hidden
        className={clsx(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          selected ? 'bg-emerald-500' : 'bg-muted'
        )}
      >
        <span
          className={clsx(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            selected ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </span>
    </button>
  );
}
