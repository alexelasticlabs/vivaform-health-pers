import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PhoneMockup } from "../components/landing/PhoneMockup";
// import { FloatingTag } from "../components/landing/FloatingTag"; // not used currently
import { ProgressCard } from "../components/landing/ProgressCard";
// import { useNavigate } from "react-router-dom"; // navigate not used here
import { trackConversion } from "../lib/analytics";
import { useIntersectionObserver } from "../hooks/use-intersection-observer";
import { AppStoreButtons } from "../components/app-store-buttons";
// import { useUserStore } from "../store/user-store"; // not used in landing
type ValueProp = {
  title: string;
  description: string;
  icon: string;
};
type FeatureHighlight = {
  title: string;
  description: string;
  icon: string;
};
type Testimonial = {
  name: string;
  role: string;
  content: string;
  initials: string;
  avatarUrl?: string;
};
type FaqItem = {
  id: string;
  question: string;
  answer: string;
};
const valueProps: ValueProp[] = [
  {
    title: "Personalized",
    description: "Tailored to your goals and lifestyle",
    icon: "🎯"
  },
  {
    title: "Dietitian-Informed",
    description: "Evidence-based expert guidance",
    icon: "🥗"
  },
  {
    title: "Privacy-First",
    description: "Encrypted, secure, never shared",
    icon: "🔒"
  },
  {
    title: "Scientifically Based",
    description: "Built on nutrition science and validated methods",
    icon: "🧪"
  }
];
const featureHighlights: FeatureHighlight[] = [
  {
    title: "Smart nutrition tracking",
    description: "Log meals instantly with feedback",
    icon: "📊"
  },
  {
    title: "Progress visualization",
    description: "Charts for weight, habits, nutrition",
    icon: "📈"
  },
  {
    title: "Personalized insights",
    description: "Daily actionable recommendations",
    icon: "💡"
  },
  {
    title: "Meal planning",
    description: "Weekly plans matching your needs",
    icon: "🍱"
  },
  {
    title: "Smart reminders",
    description: "Gentle, customizable notifications",
    icon: "⏰"
  },
  {
    title: "Health integrations",
    description: "Sync with Apple Health & Google Fit",
    icon: "🔗"
  }
];
const testimonials: Testimonial[] = [
  {
    name: "Sarah M.",
    role: "Lost 8 kg in 3 months",
    content: "VivaForm made tracking effortless. The insights are spot-on and keep me motivated.",
    initials: "SM",
    avatarUrl: "https://i.pravatar.cc/120?img=47"
  },
  {
    name: "James T.",
    role: "Marathon runner",
    content: "Finally, a nutrition app that understands my training needs. Game changer!",
    initials: "JT",
    avatarUrl: "https://i.pravatar.cc/120?img=12"
  },
  {
    name: "Linda K.",
    role: "Vegan for 2 years",
    content: "Best app for plant-based nutrition. Smart recommendations, zero hassle.",
    initials: "LK",
    avatarUrl: "https://i.pravatar.cc/120?img=32"
  }
];
const faqItems: FaqItem[] = [
  {
    id: "faq-free-trial",
    question: "Do I need a credit card to get started?",
    answer:
      "Not at all! VivaForm is free to start. Take the quiz, explore core features, and upgrade to premium only when you're ready for advanced tools."
  },
  {
    id: "faq-dietary-needs",
    question: "Is VivaForm suitable for specific dietary needs?",
    answer:
      "Absolutely. VivaForm supports vegetarian, vegan, pescetarian, dairy-free, gluten-free, and low-FODMAP patterns. You’ll get ingredient suggestions, swaps, and alerts for allergens — all adjustable in Settings."
  },
  {
    id: "faq-difference",
    question: "How does VivaForm differ from other apps?",
    answer:
      "We combine medical expertise with privacy-first design. Your data stays yours, and our recommendations come from dietitians, not external AI."
  },
  {
    id: "faq-cancel",
    question: "Can I cancel my subscription anytime?",
    answer: "Yes! Cancel anytime from your account settings. No hidden fees, no questions asked."
  },
  {
    id: "faq-platforms",
    question: "What platforms does VivaForm support?",
    answer: "VivaForm is available on iOS, Android, and web. All platforms sync seamlessly, so you can switch between devices."
  },
  {
    id: "faq-data-security",
    question: "How is my health data protected?",
    answer:
      "Your data is encrypted in transit (TLS 1.3) and at rest (AES‑256). We’re GDPR compliant, do not sell data, and only use trusted providers like Stripe for payments. You can export or delete your data anytime from your account."
  },
  {
    id: "faq-pricing",
    question: "How much does VivaForm Premium cost?",
    answer:
      "VivaForm Premium starts with a free trial, then $4.99/month or $39.99/year. Cancel anytime from your account."
  }
];

export const LandingPage = () => {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [whyRef, whyVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [featuresRef, featuresVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [testimonialsRef, testimonialsVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [heroVisible, setHeroVisible] = useState(false);
  const heroStats = [
    { label: "Active users", value: "125k+" },
    { label: "Avg. rating", value: "4.9/5" },
    { label: "Countries", value: "32" }
  ];

  useEffect(() => {
    // trigger gentle fade-in on mount
    const t = setTimeout(() => setHeroVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Build FAQPage JSON-LD from visible items
  const faqJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }), []);

  // Open FAQ item from URL hash
  useEffect(() => {
    const applyHash = () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash?.slice(1);
      if (!hash) return;
      if (faqItems.some((f) => f.id === hash)) setOpenFaqId(hash);
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  return (
    <main>

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-teal-100 to-emerald-50 py-20 sm:py-28 dark:from-teal-900/30 dark:to-emerald-900/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Content */}
            <div className={`relative z-10 transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <h1 className="font-display text-5xl font-bold leading-tight tracking-tight text-gray-900 dark:text-gray-50 sm:text-6xl lg:text-7xl">
                Discover your perfect nutrition plan.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-gray-800 dark:text-gray-200 sm:text-xl">
                Take our 2-minute quiz and unlock your personalized health journey — registration comes after your results.
              </p>
              
              <div className={`mt-10 flex flex-col gap-4 sm:flex-row sm:items-center transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <Link
                  to="/quiz"
                  onClick={() => trackConversion("hero_cta_click", { placement: "hero" })}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-8 py-4 text-base font-semibold text-white shadow-xl transition-transform hover:scale-105 active:translate-y-[1px] motion-safe:animate-pulse hover:animate-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:focus-visible:ring-emerald-400"
                >
                  Take the Quiz
                  <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <p className="text-sm text-gray-700 dark:text-gray-300 sm:ml-2">You’ll create your account after seeing your plan.</p>
              </div>

              <p className="mt-8 text-sm font-medium text-gray-700 dark:text-gray-300">Available on every platform</p>
              <div className="mt-4">
                <AppStoreButtons />
              </div>
            </div>

            {/* Right: Phone Mockup */}
            <div className="relative flex items-center justify-center lg:justify-end">
              <PhoneMockup>
                <ProgressCard />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/20 bg-white/90 p-3.5 shadow-sm backdrop-blur-sm dark:border-gray-700/40 dark:bg-neutral-900/70">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Weight</p>
                    <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-gray-50">68.2</p>
                    <p className="mt-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">-2.4 kg</p>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/90 p-3.5 shadow-sm backdrop-blur-sm dark:border-gray-700/40 dark:bg-neutral-900/70">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Streak</p>
                    <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-gray-50">24</p>
                    <p className="mt-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-400">days 🔥</p>
                  </div>
                </div>
              </PhoneMockup>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by section */}
      <section className="border-t border-border/40 bg-surface/60 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-12">
            <span className="text-sm font-medium text-muted-foreground">Trusted by teams at</span>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-70 transition-opacity hover:opacity-100 sm:gap-12">
              <div className="flex h-8 items-center justify-center text-lg font-semibold text-muted-foreground">Healthline Labs</div>
              <div className="flex h-8 items-center justify-center text-lg font-semibold text-muted-foreground">Mindful Nutrition</div>
              <div className="flex h-8 items-center justify-center text-lg font-semibold text-muted-foreground">Athletica Club</div>
              <div className="flex h-8 items-center justify-center text-lg font-semibold text-muted-foreground">Wellness Pro</div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Stats Section */}
      <section className="bg-background py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl font-bold text-foreground sm:text-4xl">{stat.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Why Choose VivaForm Section */}
      <section id="why" className="bg-background py-20 sm:py-24" ref={whyRef}>
        <div
          className={`mx-auto max-w-7xl px-6 transition-all duration-700 lg:px-8 ${
            whyVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Choose VivaForm?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-prose mx-auto">
              Medical expertise meets personalized guidance
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-6xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {valueProps.map((prop, idx) => (
                <div
                  key={prop.title}
                  className="group rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:bg-card-hover"
                >
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${[
                      "bg-gradient-to-br from-emerald-500/10 to-teal-500/20",
                      "bg-gradient-to-br from-sky-500/10 to-cyan-500/20",
                      "bg-gradient-to-br from-amber-500/10 to-orange-500/20",
                      "bg-gradient-to-br from-fuchsia-500/10 to-pink-500/20"
                    ][idx % 4]}`}
                    aria-hidden="true"
                  >
                    {prop.icon}
                  </div>
                  <h3 className="mb-3 font-display text-xl font-semibold text-foreground">{prop.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{prop.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Features Grid */}
      <section id="features" className="bg-surface py-20 sm:py-24" ref={featuresRef}>
        <div
          className={`mx-auto max-w-7xl px-6 transition-all duration-700 lg:px-8 ${
            featuresVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to succeed
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-prose mx-auto">
              Everything you need — beautifully simple.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-6xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featureHighlights.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:bg-card-hover hover:border-emerald-500/30 hover:bg-gradient-to-br hover:from-emerald-500/5 hover:to-teal-500/5"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/20 text-2xl">
                    {feature.icon}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section id="testimonials" className="bg-background py-20 sm:py-24" ref={testimonialsRef}>
        <div
          className={`mx-auto max-w-7xl px-6 transition-all duration-700 lg:px-8 ${
            testimonialsVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Loved by thousands
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-prose mx-auto">
              Real results from real people
            </p>
          </div>
          <div className="mx-auto max-w-6xl">
            {/* Mobile: horizontal scroll-snap, Desktop: 3-column grid */}
            <div className="md:hidden -mx-6 px-6">
              <div
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
                aria-label="Testimonials carousel"
              >
                {testimonials.map((t) => (
                  <div
                    key={t.name}
                    className="min-w-[85%] snap-start rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      {t.avatarUrl ? (
                        <img
                          src={t.avatarUrl}
                          alt={`${t.name} avatar`}
                          className="h-12 w-12 rounded-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-semibold text-white">
                          {t.initials}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">"{t.content}"</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:grid grid-cols-1 gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <div className="mb-4 flex items-center gap-3">
                    {t.avatarUrl ? (
                      <img src={t.avatarUrl} alt={`${t.name} avatar`} className="h-12 w-12 rounded-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-semibold text-white">
                        {t.initials}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">"{t.content}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section id="faq" className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {faqItems.map((item) => {
              const isOpen = openFaqId === item.id;
              const headerId = `faq-header-${item.id}`;
              const panelId = `faq-panel-${item.id}`;
              return (
                <div
                  key={item.id}
                  id={item.id}
                  role="region"
                  aria-labelledby={headerId}
                  className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 shadow-sm transition-all hover:shadow-md dark:border-neutral-700/60 dark:bg-neutral-900/70"
                >
                  <button
                    id={headerId}
                    type="button"
                    aria-controls={panelId}
                    aria-expanded={isOpen}
                    onClick={() => {
                      const next = isOpen ? null : item.id;
                      setOpenFaqId(next);
                      if (typeof window !== 'undefined') {
                        window.history.replaceState(null, '', next ? `#${next}` : window.location.pathname);
                      }
                    }}
                    className="flex w-full items-center justify-between px-6 py-5 text-left text-base font-semibold text-foreground transition-colors hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:focus-visible:ring-offset-neutral-900"
                  >
                    {item.question}
                    <svg
                      className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div id={panelId} role="region" aria-live="polite" className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Mini CTA under FAQ */}
          <div className="mt-10 flex justify-center">
            <Link
              to="/quiz"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-all hover:scale-[1.01] hover:border-emerald-500/40 hover:shadow-md"
            >
              Still curious? Take the quiz
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* SEO JSON-LD for FAQ */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        </div>
      </section>
      {/* Final CTA Section */}
      <section id="cta" className="bg-background py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 px-10 py-16 text-center shadow-2xl sm:px-16">
            <div className="relative">
              <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to transform your health?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-50">
                Join 125,000+ people achieving their wellness goals with VivaForm
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link
                  to="/quiz"
                  onClick={() => trackConversion("start_quiz_click", { placement: "cta" })}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-emerald-600 shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl active:scale-[0.99]"
                >
                  Start free today
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-2xl border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-all hover:scale-[1.01] hover:border-white/60 hover:bg-white/20 active:scale-[0.99]"
                >
                  Sign in
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-emerald-50/90">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M20 12V7a2 2 0 0 0-2-2h-3"/><path d="M4 12v5a2 2 0 0 0 2 2h3"/><path d="M5 12h14"/><path d="M9 16V8"/><path d="M15 16V8"/>
                  </svg>
                  Stripe Secure Payments
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur">GDPR Compliant</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur">Data Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="sm:hidden fixed bottom-5 right-5 z-40">
        <Link
          to="/quiz"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          aria-label="Get started"
        >
          Get Started
        </Link>
      </div>
    </main>
  );
};
export default LandingPage;