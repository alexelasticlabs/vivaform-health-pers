import { type ReactNode } from 'react';

type QuizCardVariant = 'default' | 'goals' | 'nutrition' | 'plan';

interface VariantStyles {
  wrap: string;
  eyebrow: string;
  title: string;
  text: string;
}

const VARIANT_STYLES: Record<QuizCardVariant, VariantStyles> = {
  default: {
    wrap: 'border-border bg-card',
    eyebrow: 'bg-emerald-50 text-emerald-700',
    title: 'text-foreground',
    text: 'text-muted-foreground',
  },
  goals: {
    wrap: 'border-amber-100 bg-gradient-to-b from-amber-50 via-white to-orange-50/60',
    eyebrow: 'bg-amber-100 text-amber-800',
    title: 'text-amber-900',
    text: 'text-amber-900/80',
  },
  nutrition: {
    wrap: 'border-rose-100 bg-gradient-to-b from-rose-50 via-white to-rose-50/60',
    eyebrow: 'bg-rose-100 text-rose-800',
    title: 'text-rose-900',
    text: 'text-rose-900/80',
  },
  plan: {
    wrap: 'border-indigo-100 bg-gradient-to-b from-indigo-50 via-white to-indigo-50/70',
    eyebrow: 'bg-indigo-100 text-indigo-800',
    title: 'text-indigo-900',
    text: 'text-indigo-900/80',
  },
};

interface QuizCardProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  helpText?: string;
  eyebrowLabel?: string;
  variant?: QuizCardVariant;
  children: ReactNode;
}

export function QuizCard({ title, subtitle, emoji, helpText, eyebrowLabel, variant = 'default', children }: QuizCardProps) {
  const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.default;

  return (
    <div className={`w-full max-w-2xl mx-auto rounded-2xl border p-6 shadow-lg md:p-8 ${styles.wrap}`}>
      <div className="mb-6">
        {eyebrowLabel && (
          <span className={`mb-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${styles.eyebrow}`}>
            {eyebrowLabel}
          </span>
        )}
        {emoji && <div className="text-5xl mb-4">{emoji}</div>}
        <h2 className={`mb-2 font-bold [font-size:clamp(1.5rem,2.5vw,1.875rem)] ${styles.title}`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`text-sm md:text-base ${styles.text}`}>{subtitle}</p>
        )}
        {helpText && (
          <p className={`mt-2 text-xs ${styles.text}`}>{helpText}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export type { QuizCardVariant };
