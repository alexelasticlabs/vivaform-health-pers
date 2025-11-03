import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X, Star, Zap } from 'lucide-react';
import { createCheckoutSession } from '../api/subscriptions';
import { useUserStore } from '../store/user-store';

const PLANS = [
  {
    id: 'free',
    name: 'FREE',
    price: '$0',
    period: 'forever',
    description: 'Healthy nutrition basics',
    features: [
      { text: 'Calorie and macro tracking', included: true },
      { text: 'Water tracking', included: true },
      { text: 'Weight tracking', included: true },
      { text: 'Basic recommendations', included: true },
      { text: 'Personalized meal plan', included: false },
      { text: 'AI meal generator', included: false },
      { text: 'Advanced analytics', included: false },
      { text: 'Apple Health/Google Fit integration', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Current Plan',
    highlighted: false,
  },
  {
    id: 'monthly',
    name: 'MONTHLY',
    price: '$4.87',
    period: 'per month',
    description: 'For serious results',
    badge: 'Flexible',
    features: [
      { text: 'Everything from FREE', included: true },
      { text: 'Personalized meal plan', included: true },
      { text: 'AI meal generator', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Apple Health/Google Fit integration', included: true },
      { text: 'Reminders and notifications', included: true },
      { text: 'Data export', included: true },
      { text: 'Priority support', included: true },
      { text: 'Ad-free', included: true },
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    id: 'quarterly',
    name: 'QUARTERLY',
    price: '$17.63',
    period: 'for 4 months',
    originalPrice: '$19.48',
    savings: '~10% off',
    description: 'Best for building habits',
    badge: 'Popular',
    features: [
      { text: 'Everything from FREE', included: true },
      { text: 'Personalized meal plan', included: true },
      { text: 'AI meal generator', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Apple Health/Google Fit integration', included: true },
      { text: 'Reminders and notifications', included: true },
      { text: 'Data export', included: true },
      { text: 'Priority support', included: true },
      { text: 'Ad-free', included: true },
    ],
    cta: 'Get Started',
    highlighted: true,
  },
  {
    id: 'annual',
    name: 'ANNUAL',
    price: '$28.76',
    period: 'for 12 months',
    originalPrice: '$58.44',
    savings: '~50% off',
    description: 'Maximum value',
    badge: 'Best Value',
    features: [
      { text: 'Everything from FREE', included: true },
      { text: 'Personalized meal plan', included: true },
      { text: 'AI meal generator', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Apple Health/Google Fit integration', included: true },
      { text: 'Reminders and notifications', included: true },
      { text: 'Data export', included: true },
      { text: 'Priority support', included: true },
      { text: 'Ad-free', included: true },
      { text: '1 year commitment = biggest savings', included: true },
    ],
    cta: 'Get Started',
    highlighted: false,
  },
];

const TESTIMONIALS = [
  {
    name: 'Anna K.',
    role: 'Lost 12 kg',
    text: 'VivaForm finally helped me reach my goals. The personalized meal plan and simple tracking made it easy.',
    avatar: '👩',
  },
  {
    name: 'Dmitry S.',
    role: 'Gained 8 kg of muscle',
    text: 'Excellent tool for athletes. Accurate macro tracking and Apple Health integration saved so much time.',
    avatar: '👨',
  },
  {
    name: 'Maria P.',
    role: 'Improved health',
    text: 'After 3 months of use, I feel so much better. The recommendations really work!',
    avatar: '👩‍🦰',
  },
];

const FAQ = [
  {
    question: 'Can I cancel my subscription?',
    answer: 'Yes, you can cancel your subscription anytime in account settings. After cancellation, access to premium features will remain until the end of the paid period.',
  },
  {
    question: 'Is there a trial period?',
    answer: 'The FREE plan is available to all users without time limits. You can try the basic features before upgrading to PREMIUM.',
  },
  {
    question: 'What payment methods are supported?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express) through the secure Stripe platform.',
  },
  {
    question: 'Can I switch to a different plan?',
    answer: 'Yes, you can switch to another plan at any time. When upgrading, the difference will be calculated proportionally.',
  },
  {
    question: 'Does it work on mobile?',
    answer: 'Yes! We have a mobile app for iOS and Android, as well as a responsive web version.',
  },
];

export function PremiumPage() {
  const navigate = useNavigate();
  const profile = useUserStore((state) => state.profile);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      return;
    }
    
    // Check if user is authenticated
    if (!profile) {
      navigate('/login?redirect=/premium');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // All paid plans use their ID directly (monthly, quarterly, annual)
      const subscriptionPlan = planId as 'monthly' | 'quarterly' | 'annual';
      
      const { url } = await createCheckoutSession({
        plan: subscriptionPlan as 'monthly' | 'quarterly' | 'annual',
        successUrl: `${window.location.origin}/premium?success=true`,
        cancelUrl: `${window.location.origin}/premium?canceled=true`
      });
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Failed to get payment URL');
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to create payment session. Please try again later.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Error Alert */}
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-red-100 border-2 border-red-500 rounded-xl p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">Error</h4>
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 font-bold"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-6">
            <Zap size={16} />
            Transform Your Nutrition
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Start with a free plan or get full access to personalized meal plans and AI recommendations
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl p-6 ${
                plan.highlighted
                  ? 'border-4 border-blue-500 transform lg:scale-105'
                  : 'border-2 border-gray-200'
              }`}
            >
              {plan.badge && (
                <div className="absolute top-0 right-4 transform -translate-y-1/2">
                  <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-lg">
                    <Star size={12} fill="currentColor" />
                    {plan.badge}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-xs mb-3">{plan.description}</p>
                <div className="flex flex-col gap-1">
                  {('originalPrice' in plan && plan.originalPrice) && (
                    <span className="text-sm text-gray-400 line-through">
                      {plan.originalPrice}
                    </span>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-xs text-gray-600">/ {plan.period}</span>
                  </div>
                  {('savings' in plan && plan.savings) && (
                    <span className="text-xs font-semibold text-green-600">
                      {plan.savings}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={plan.id === 'free' || isLoading}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all mb-6 ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:shadow-lg hover:scale-[1.02]'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading && plan.id !== 'free' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                  </span>
                ) : (
                  plan.cta
                )}
              </button>

              <ul className="space-y-2">
                {plan.features.slice(0, 6).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                    ) : (
                      <X className="text-gray-300 flex-shrink-0 mt-0.5" size={16} />
                    )}
                    <span
                      className={`text-xs ${
                        feature.included ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Success Stories
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQ.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenFaqIndex(openFaqIndex === index ? null : index)
                  }
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">
                    {item.question}
                  </span>
                  <span
                    className={`transform transition-transform ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-4 text-gray-600">{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who have already achieved their goals
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/quiz"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
            >
              Take Quiz →
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
