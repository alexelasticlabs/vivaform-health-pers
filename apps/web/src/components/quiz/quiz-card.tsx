import { type ReactNode } from 'react';

interface QuizCardProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  helpText?: string;
  children: ReactNode;
}

export function QuizCard({ title, subtitle, emoji, helpText, children }: QuizCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-8 rounded-2xl shadow-lg border border-border bg-card">
      <div className="mb-6">
        {emoji && <div className="text-5xl mb-4">{emoji}</div>}
        <h2 className="font-bold text-foreground mb-2 [font-size:clamp(1.5rem,2.5vw,1.875rem)]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-muted-foreground text-sm md:text-base">{subtitle}</p>
        )}
        {helpText && (
          <p className="mt-2 text-xs text-muted-foreground">{helpText}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
