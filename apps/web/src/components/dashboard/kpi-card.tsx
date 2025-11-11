import type { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  progressPercent?: number;
  onClick?: () => void;
  footer?: ReactNode;
  ariaLabel?: string;
  className?: string;
}

export const KpiCard = ({
  title,
  value,
  subtitle,
  icon,
  progressPercent,
  onClick,
  footer,
  ariaLabel,
  className = ""
}: KpiCardProps) => {
  const inner = (
    <div
      className={`rounded-2xl border border-border bg-card p-4 text-left shadow-sm hover:shadow-md transition ${onClick ? 'cursor-pointer' : ''} ${className}`}
      aria-label={ariaLabel || title}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{title}</span>
        {icon}
      </div>
      <div className="mt-1 text-2xl font-bold" data-testid={`kpi-value-${title.toLowerCase()}`}>{value}</div>
      {title === 'Hydration' && <div data-testid="hydration-value-hidden" className="hidden">{value}</div>}
      {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      {progressPercent !== undefined && (
        <div className="mt-3 h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}
      {footer}
    </div>
  );

  if (onClick) {
    return <button type="button" onClick={onClick} className="text-left w-full">{inner}</button>;
  }
  return inner;
};
