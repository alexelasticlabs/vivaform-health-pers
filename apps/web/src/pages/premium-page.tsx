import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Check, Lock, Sparkles, Shield, TrendingUp, Star, ChevronDown } from 'lucide-react';
import { createCheckoutSession, logPremiumView } from '@/api';
import { useUserStore } from '@/store/user-store';
import { toast } from 'sonner';
import { SUBSCRIPTION_PLANS } from "@vivaform/shared";

type PlanType = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

const PLANS = SUBSCRIPTION_PLANS.map(p => {
  const numericPrice = parseFloat(p.price.replace(/[^0-9.]/g, ''));
  return {
    id: p.plan,
    name: p.title,
    duration: p.plan === 'MONTHLY' ? '1 month' : p.plan === 'QUARTERLY' ? '3 months' : '12 months',
    price: numericPrice,
    pricePerMonth: p.plan === 'ANNUAL' ? +(numericPrice / 12).toFixed(2) : p.plan === 'QUARTERLY' ? +(numericPrice / 3).toFixed(2) : numericPrice,
    savings: p.description.includes('50') ? 'Save ~50%' : p.description.includes('10') ? 'Save ~10%' : '',
    emoji: p.plan === 'MONTHLY' ? '🗓️' : p.plan === 'QUARTERLY' ? '🎯' : '🏆',
    recommended: p.plan === 'ANNUAL'
  } as const;
});

const BENEFITS = [
  {
    icon: Sparkles,
    title: 'Personalized Meal Plan',
    description: 'Custom nutrition tailored to your goals, tastes, and lifestyle',
  },
  {
    icon: TrendingUp,
    title: 'Smart Recommendations',
    description: 'Daily nutrition advice and real-time plan adjustments',
  },
  {
    icon: Crown,
    title: 'Priority Support',
    description: 'Fast responses from our team of nutrition experts',
  },
  {
    icon: Shield,
    title: 'Exclusive Content',
    description: 'Access to premium recipes and workout programs',
  },
];

const FEATURES = [
  { name: 'Calorie and macro tracking', free: true, premium: true },
  { name: 'Water tracking', free: true, premium: true },
  { name: 'Weight tracking', free: true, premium: true },
  { name: 'Basic recommendations', free: true, premium: true },
  { name: 'Personalized meal plan', free: false, premium: true },
  { name: 'Smart AI recommendations', free: false, premium: true },
  { name: 'Priority support', free: false, premium: true },
];

const FAQS = [
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time. Cancellation takes effect at the end of your current billing period.',
  },
  {
    question: 'What happens after my subscription ends?',
    answer: 'After your subscription ends, you retain access to basic features. Your data is never deleted, and you can reactivate anytime.',
  },
  {
    question: 'Can I change my plan?',
    answer: 'Yes, you can change your plan at any time. When upgrading, the difference will be prorated automatically.',
  },
  {
    question: 'Is my payment information secure?',
    answer: 'We use Stripe, an international payment system with the highest security standards. Your payment details are never stored on our servers.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Anna M.',
    text: 'Lost 8kg in 3 months! The personalized meal plan helped me eat healthy without feeling deprived.',
    rating: 5,
  },
  {
    name: 'Dmitry K.',
    text: 'Finally found an app that actually works. Accurate recommendations and intuitive interface.',
    rating: 5,
  },
  {
    name: 'Maria S.',
    text: 'Love tracking everything in one place. The meal plan really helps me reach my goals!',
    rating: 5,
  },
];

export default function PremiumPage() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.profile);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('ANNUAL');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const isPremium = user?.tier === 'PREMIUM';

  useEffect(() => {
    // Analytics: Premium page view
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'premium_page_view', {
        user_id: user?.id,
        subscription_tier: user?.tier,
      });
    }
    // Audit log (backend)
    void logPremiumView();
  }, [user?.id, user?.tier]);

  const handlePlanSelect = (planId: PlanType) => {
    setSelectedPlan(planId);
    
    // Analytics: Plan click
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'premium_plan_click', {
        plan_id: planId,
        user_id: user?.id,
      });
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please log in to subscribe');
      navigate('/login');
      return;
    }

    if (isPremium) {
      toast.info('You already have an active subscription');
      return;
    }

    setIsLoading(true);

    try {
      // Analytics: Checkout start
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'premium_checkout_start', {
          plan_id: selectedPlan,
          user_id: user.id,
          currency: 'USD',
          value: PLANS.find((p) => p.id === selectedPlan)?.price,
        });
      }

      const { url } = await createCheckoutSession({
        plan: selectedPlan.toUpperCase() as 'MONTHLY' | 'QUARTERLY' | 'ANNUAL',
        successUrl: `${window.location.origin}/app?premium=success`,
        cancelUrl: `${window.location.origin}/premium?canceled=true`,
      });

      if (url) {
        window.location.href = url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('An error occurred while creating checkout session');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 text-sm font-medium text-orange-700">
            <Crown className="h-4 w-4" />
            Premium Access
          </div>
          
          <h1 data-testid="premium-title" className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Unlock your personalized<br />nutrition plan 🥗
          </h1>
          
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 sm:text-xl">
            Get custom nutrition, smart recommendations, and expert support to achieve your goals
          </p>

          {isPremium && (
            <div data-testid="premium-active-indicator" className="mb-8 inline-flex items-center gap-2 rounded-lg bg-green-100 px-6 py-3 text-green-800">
              <Crown className="h-5 w-5" />
              <span className="font-medium">Your VivaForm+ is active</span>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Everything for mindful health
          </h2>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((benefit, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-green-300 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-blue-100">
                  <benefit.icon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-white/50 py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Free vs Premium
          </h2>
          
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Free</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    <span className="flex items-center justify-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      Premium
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {FEATURES.map((feature, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm text-gray-900">{feature.name}</td>
                    <td className="px-6 py-4 text-center">
                      {feature.free ? (
                        <Check className="mx-auto h-5 w-5 text-green-600" />
                      ) : (
                        <Lock className="mx-auto h-5 w-5 text-gray-300" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {feature.premium ? (
                        <Check className="mx-auto h-5 w-5 text-green-600" />
                      ) : (
                        <Lock className="mx-auto h-5 w-5 text-gray-300" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20" data-testid="premium-plans-section">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900" data-testid="premium-plans-title">
            Choose your plan
          </h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map(plan => (
              <button key={plan.id} type="button"
                      data-testid={`plan-card-${plan.id}`}
                      onClick={() => handlePlanSelect(plan.id as PlanType)}
                      className={`group relative rounded-2xl border p-6 text-left shadow-sm transition-all ${selectedPlan === plan.id ? 'border-emerald-500 ring-2 ring-emerald-500/40' : 'border-gray-200 hover:border-emerald-300'} ${plan.recommended ? 'bg-gradient-to-br from-emerald-50 to-teal-50' : 'bg-white'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{plan.emoji}</span>
                  {plan.recommended && <span data-testid="plan-badge-best" className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Best value</span>}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{plan.duration}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-500">USD</span>
                </div>
                {plan.savings && <p className="text-xs font-medium text-emerald-600 mb-2">{plan.savings}</p>}
                <p className="text-xs text-gray-500">{plan.pricePerMonth} USD / month</p>
                <div className={`absolute inset-0 rounded-2xl pointer-events-none ${selectedPlan === plan.id ? 'ring-2 ring-emerald-500/60' : ''}`}></div>
              </button>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              data-testid="premium-activate-button"
              onClick={handleCheckout}
              disabled={isLoading || isPremium}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : isPremium ? (
                <>
                  <Crown className="h-5 w-5" />
                  Already Active
                </>
              ) : (
                <>
                  <Crown className="h-5 w-5" />
                  Activate VivaForm+
                </>
              )}
            </button>
            
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p>
                or{' '}
                <button
                  data-testid="premium-continue-free"
                  onClick={() => navigate('/app')}
                  className="text-green-600 hover:underline"
                >
                  continue for free
                </button>
              </p>
              <p>
                <button
                  data-testid="premium-view-history"
                  onClick={() => navigate('/premium/history')}
                  className="text-green-600 hover:underline"
                >
                  View subscription history
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            What our users say
          </h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 text-gray-700">{testimonial.text}</p>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-600 transition-transform ${
                      expandedFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="border-t border-gray-200 px-6 py-4">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="border-t border-gray-200 bg-white py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700">Secure payments via Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700">SSL encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700">PCI DSS certified</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}