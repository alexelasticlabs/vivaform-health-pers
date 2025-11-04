import { Sparkles, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import type { RecommendationEntry } from '@vivaform/shared';

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

interface RecommendationsWidgetProps {
  recommendations: RecommendationEntry[];
  isPremium: boolean;
  updatedAt?: string;
}

export function RecommendationsWidget({ recommendations, isPremium, updatedAt }: RecommendationsWidgetProps) {
  const displayedRecs = isPremium ? recommendations : recommendations.slice(0, 2);
  const hasMore = recommendations.length > displayedRecs.length;

  // Analytics: Track widget view
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'dashboard_widget_view', {
        widget_name: 'recommendations',
        is_premium: isPremium,
        total_recommendations: recommendations.length,
        displayed_recommendations: displayedRecs.length
      });
    }
  }, [recommendations.length, isPremium, displayedRecs.length]);

  const timeAgo = updatedAt ? getTimeAgo(new Date(updatedAt)) : null;

  return (
    <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Recommendations</h2>
          {timeAgo && (
            <p className="text-xs text-muted-foreground">Updated {timeAgo}</p>
          )}
        </div>
        <Sparkles size={20} className="text-emerald-500" />
      </div>

      <div className="mt-5 space-y-3">
        {displayedRecs.length > 0 ? (
          <>
            {displayedRecs.map((rec) => (
              <div key={rec.id} className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 dark:from-emerald-950/30 dark:to-teal-950/30">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{rec.title}</p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{rec.body}</p>
              </div>
            ))}
            
            {!isPremium && hasMore && (
              <div className="relative rounded-xl border-2 border-dashed border-yellow-400 bg-yellow-50/50 p-4 dark:bg-yellow-950/20">
                <div className="flex items-start gap-3">
                  <Lock size={20} className="text-yellow-600 dark:text-yellow-400" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {recommendations.length - 2} more personalized tips
                    </p>
                    <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                      Unlock with VivaForm+ to see all recommendations
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isPremium && (
              <Link
                to="/recommendations"
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm font-semibold transition hover:bg-muted/60"
              >
                View full plan
                <ArrowRight size={16} />
              </Link>
            )}
          </>
        ) : (
          <div className="rounded-xl bg-muted/20 p-6 text-center">
            <Sparkles size={32} className="mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              We'll prepare tips after you log today's meals 🌿
            </p>
          </div>
        )}
      </div>

      {!isPremium && recommendations.length > 0 && (
        <Link
          to="/premium"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
        >
          <Sparkles size={14} />
          Unlock Premium
        </Link>
      )}
    </div>
  );
}

