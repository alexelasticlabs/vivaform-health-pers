/**
 * Smart Upgrade Prompt
 * Context-aware premium upgrade prompts with A/B testing support
 */

import React from 'react';
import { Crown, X, Sparkles, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/dashboard-utils';
import { Button } from '@/components/ui/button';

export type UpgradeContext =
  | 'feature-lock'
  | 'milestone-achievement'
  | 'engagement-reward'
  | 'free-trial-offer'
  | 'limited-time-deal';

interface SmartUpgradePromptProps {
  context: UpgradeContext;
  onUpgrade: () => void;
  onDismiss: () => void;
  className?: string;
  variant?: 'modal' | 'banner' | 'card';
}

export const SmartUpgradePrompt: React.FC<SmartUpgradePromptProps> = ({
  context,
  onUpgrade,
  onDismiss,
  className,
  variant = 'modal',
}) => {
  const getContent = () => {
    switch (context) {
      case 'feature-lock':
        return {
          title: 'Unlock Premium Features',
          description: 'Get unlimited meal plans, advanced analytics, and personalized recommendations',
          benefits: ['Unlimited meal plans', 'Advanced analytics', 'Priority support', 'Custom recipes'],
          cta: 'Upgrade to Premium',
          icon: <Crown className="h-6 w-6" />,
          color: 'amber',
        };

      case 'milestone-achievement':
        return {
          title: '🎉 Congrats on your progress!',
          description: "You've achieved amazing results! Keep going with Premium features",
          benefits: ['Track detailed progress', 'Export your data', 'Set multiple goals', 'Advanced insights'],
          cta: 'Try Premium Free for 7 Days',
          icon: <TrendingUp className="h-6 w-6" />,
          color: 'emerald',
        };

      case 'engagement-reward':
        return {
          title: "You're on fire! 🔥",
          description: "You've logged 15 meals this week. Premium users see 2x better results!",
          benefits: ['Personalized coaching', 'Weekly reports', 'Nutrition insights', 'Recipe recommendations'],
          cta: 'Unlock Premium Now',
          icon: <Sparkles className="h-6 w-6" />,
          color: 'purple',
        };

      case 'free-trial-offer':
        return {
          title: 'Try Premium Risk-Free',
          description: 'Experience all premium features for 7 days, completely free',
          benefits: ['7-day free trial', 'Cancel anytime', 'Full access', 'No credit card required'],
          cta: 'Start Free Trial',
          icon: <Calendar className="h-6 w-6" />,
          color: 'blue',
        };

      case 'limited-time-deal':
        return {
          title: '⚡ Special Offer - 40% Off',
          description: 'Limited time: Get Premium at the best price ever!',
          benefits: ['40% off annual plan', 'All premium features', 'Priority support', 'Money-back guarantee'],
          cta: 'Claim Offer Now',
          icon: <Crown className="h-6 w-6" />,
          color: 'red',
        };

      default:
        return {
          title: 'Upgrade to Premium',
          description: 'Unlock all features and reach your goals faster',
          benefits: ['Advanced features', 'Priority support', 'Detailed analytics', 'Custom plans'],
          cta: 'Upgrade Now',
          icon: <Crown className="h-6 w-6" />,
          color: 'amber',
        };
    }
  };

  const content = getContent();

  const colorClasses = {
    amber: {
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-900/30',
      text: 'text-amber-900 dark:text-amber-200',
      button: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
    },
    emerald: {
      gradient: 'from-emerald-500 to-green-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-emerald-200 dark:border-emerald-900/30',
      text: 'text-emerald-900 dark:text-emerald-200',
      button: 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600',
    },
    purple: {
      gradient: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50 dark:bg-purple-950/20',
      border: 'border-purple-200 dark:border-purple-900/30',
      text: 'text-purple-900 dark:text-purple-200',
      button: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    },
    blue: {
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-900/30',
      text: 'text-blue-900 dark:text-blue-200',
      button: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
    },
    red: {
      gradient: 'from-red-500 to-orange-500',
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-200 dark:border-red-900/30',
      text: 'text-red-900 dark:text-red-200',
      button: 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600',
    },
  };

  const colors = colorClasses[content.color as keyof typeof colorClasses];

  if (variant === 'banner') {
    return (
      <div className={cn('relative overflow-hidden rounded-lg border p-4', colors.bg, colors.border, className)}>
        <button
          onClick={onDismiss}
          className="absolute right-2 top-2 rounded-full p-1 hover:bg-white/20 dark:hover:bg-black/20"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-4">
          <div className={cn('rounded-full p-3', `bg-gradient-to-br ${colors.gradient} text-white`)}>
            {content.icon}
          </div>

          <div className="flex-1">
            <h4 className={cn('mb-1 font-bold', colors.text)}>{content.title}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">{content.description}</p>
          </div>

          <Button onClick={onUpgrade} className={cn('shadow-lg', colors.button, 'text-white')}>
            {content.cta}
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('relative overflow-hidden rounded-2xl border p-6', colors.bg, colors.border, className)}>
        <button
          onClick={onDismiss}
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-white/20 dark:hover:bg-black/20"
        >
          <X className="h-4 w-4" />
        </button>

        <div className={cn('mb-4 inline-flex rounded-full p-3', `bg-gradient-to-br ${colors.gradient} text-white`)}>
          {content.icon}
        </div>

        <h3 className={cn('mb-2 text-2xl font-bold', colors.text)}>{content.title}</h3>
        <p className="mb-4 text-slate-600 dark:text-slate-400">{content.description}</p>

        <ul className="mb-6 space-y-2">
          {content.benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-600" />
              <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
            </li>
          ))}
        </ul>

        <Button onClick={onUpgrade} className={cn('w-full shadow-lg', colors.button, 'text-white')}>
          {content.cta} →
        </Button>

        <p className="mt-3 text-center text-xs text-slate-500">30-day money-back guarantee</p>
      </div>
    );
  }

  // Modal variant
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className={cn(
          'relative w-full max-w-lg overflow-hidden rounded-2xl border bg-white p-8 shadow-2xl dark:bg-slate-900',
          colors.border,
          className
        )}
      >
        <button
          onClick={onDismiss}
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        <div className={cn('mb-6 inline-flex rounded-full p-4', `bg-gradient-to-br ${colors.gradient} text-white`)}>
          {content.icon}
        </div>

        <h2 className="mb-3 text-3xl font-bold text-slate-900 dark:text-white">{content.title}</h2>
        <p className="mb-6 text-slate-600 dark:text-slate-400">{content.description}</p>

        <ul className="mb-8 space-y-3">
          {content.benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300">{benefit}</span>
            </li>
          ))}
        </ul>

        <Button onClick={onUpgrade} className={cn('w-full py-6 text-lg shadow-lg', colors.button, 'text-white')}>
          {content.cta} →
        </Button>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-slate-500">
          <span>✓ Cancel anytime</span>
          <span>✓ 30-day guarantee</span>
          <span>✓ Secure payment</span>
        </div>
      </div>
    </div>
  );
};
