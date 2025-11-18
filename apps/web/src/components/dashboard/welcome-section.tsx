import { Crown, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import type { AuthUser } from '@vivaform/shared';

interface WelcomeSectionProps {
  user: AuthUser;
  streak?: number;
  lastSync?: string;
  subscriptionEndsAt?: string | null;
}

export function WelcomeSection({ user, streak = 0, lastSync, subscriptionEndsAt }: WelcomeSectionProps) {
  const isPremium = user.tier === 'PREMIUM';
  const lastSyncTime = lastSync
    ? new Date(lastSync).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : null;

  // Analytics: Track dashboard view
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'dashboard_view', {
        is_premium: isPremium,
        streak
      });

      // Track premium banner impression for free users
      if (!isPremium) {
        window.gtag('event', 'premium_banner_view', {
          location: 'dashboard_welcome'
        });
      }
    }
  }, [isPremium, streak]);

  return (
    <section className="space-y-4">
      {/* Welcome Card */}
      <div className="rounded-3xl border border-border bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 shadow-sm dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Hi, {user.name || 'there'} 👋🏼
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              {streak > 0 && (
                <span className="flex items-center gap-1">
                  <span className="text-orange-500">🔥</span>
                  Day {streak} on track
                </span>
              )}
              {lastSyncTime && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>Last sync: {lastSyncTime}</span>
                </>
              )}
            </div>
          </div>
          {isPremium && (
            <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
              <Crown size={14} />
              Premium
            </div>
          )}
        </div>
      </div>

      {/* Premium Banner or Status */}
      {isPremium ? (
        <div className="rounded-2xl border border-yellow-400/30 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 p-4 dark:from-yellow-950/30 dark:to-orange-950/30">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <Crown size={16} className="inline text-yellow-500" /> VivaForm+ active
            {subscriptionEndsAt && (
              <> until {new Date(subscriptionEndsAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</>
            )}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 p-5 shadow-md dark:from-yellow-950/40 dark:via-orange-950/40 dark:to-yellow-950/40">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md">
                <Zap size={20} fill="currentColor" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-gray-100">
                  Unlock your personalized plan
                </h3>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  Personalized meal plans • AI recommendations • Advanced analytics • Priority support
                </p>
              </div>
            </div>
            <Link
              to="/premium"
              onClick={() => {
                if (window.gtag) {
                  window.gtag('event', 'premium_upgrade_click', {
                    from: 'dashboard_welcome',
                    streak
                  });
                }
              }}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-600 to-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              <Zap size={14} />
              Try 7 days free
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
