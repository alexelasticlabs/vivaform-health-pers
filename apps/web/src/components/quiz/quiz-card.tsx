import { type ReactNode } from 'react';

interface QuizCardProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  children: ReactNode;
}

export function QuizCard({ title, subtitle, emoji, children }: QuizCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-8 rounded-2xl shadow-lg border border-border bg-card">
      <div className="mb-6">
        {emoji && <div className="text-5xl mb-4">{emoji}</div>}
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-muted-foreground text-sm md:text-base">{subtitle}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
