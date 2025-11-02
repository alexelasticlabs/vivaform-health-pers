import { Link } from "react-router-dom";
import { useState } from "react";

import { trackConversion } from "../lib/analytics";
import { useIntersectionObserver } from "../hooks/use-intersection-observer";
import { AppStoreButtons } from "../components/app-store-buttons";

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
    initials: "SM"
  },
  {
    name: "James T.",
    role: "Marathon runner",
    content: "Finally, a nutrition app that understands my training needs. Game changer!",
    initials: "JT"
  },
  {
    name: "Linda K.",
    role: "Vegan for 2 years",
    content: "Best app for plant-based nutrition. Smart recommendations, zero hassle.",
    initials: "LK"
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
      "Absolutely! Whether you are vegetarian, vegan, gluten-free, or managing allergies, VivaForm adapts to your unique requirements."
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
    answer: "We use bank-level encryption (AES-256) and never sell or share your data with third parties. You own your health information."
  }
];

export const LandingPage = () => {
  const handleStartClick = () => trackConversion("start_quiz_click", { placement: "hero" });

  const [whyRef, whyVisible] = useIntersectionObserver({ threshold: 0.1, freezeOnceVisible: true });
  const [featuresRef, featuresVisible] = useIntersectionObserver({ threshold: 0.1, freezeOnceVisible: true });
  const [testimonialsRef, testimonialsVisible] = useIntersectionObserver({ threshold: 0.1, freezeOnceVisible: true });
  
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const heroStats: Array<{ value: string; label: string }> = [
    { value: "125K+", label: "Active users" },
    { value: "4.8★", label: "App Store rating" },
    { value: "92%", label: "Goal completion" }
  ];

  return (
    <main className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative isolate px-6 py-16 sm:py-24 lg:py-32">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl">
            <div className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-emerald-400/20 via-teal-400/20 to-cyan-500/20" />
          </div>
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-2">
            {/* Left: Text Content */}
            <div className="flex flex-col justify-center">
              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-[3.5rem]">
                Feel-good nutrition,
                <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">
                  guided by experts
                </span>
              </h1>

              <p className="mt-6 max-w-prose text-lg leading-relaxed text-muted-foreground">
                Personalized plans, habit coaching, and clear progress—without selling your data.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/register"
                  onClick={handleStartClick}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.99]"
                >
                  Start your free journey
                  <svg
                    className="h-5 w-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-2xl border-2 border-border bg-card px-8 py-4 text-base font-semibold text-foreground shadow-sm transition-all hover:scale-[1.01] hover:border-muted-foreground hover:shadow-md active:scale-[0.99]"
                >
                  Log in
                </Link>
              </div>

              <div className="mt-12">
                <p className="text-sm font-medium text-muted-foreground">Available on every platform</p>
                <div className="mt-4">
                  <AppStoreButtons />
                </div>
              </div>
            </div>

            {/* Right: Phone Mockup */}
            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="relative">
                {/* Ambient glow */}
                <div className="pointer-events-none absolute inset-0 -z-10">
                  <div className="absolute left-1/4 top-12 h-56 w-56 rounded-full bg-emerald-400/20 blur-[100px]" />
                  <div className="absolute bottom-12 right-1/4 h-64 w-64 rounded-full bg-teal-400/15 blur-[120px]" />
                </div>

                {/* iPhone Pro Mockup - более реалистичные пропорции */}
                <div className="relative mx-auto w-[300px] sm:w-[340px]">
                  {/* Phone frame */}
                  <div className="relative overflow-hidden rounded-[3.5rem] border-[14px] border-gray-900 bg-gray-900 shadow-2xl shadow-black/40 dark:border-gray-950 dark:bg-gray-950">
                    {/* Side buttons - более детальные */}
                    <div className="absolute -left-[2px] top-[100px] h-8 w-[2px] rounded-l-full bg-gray-800" />
                    <div className="absolute -left-[2px] top-[140px] h-14 w-[2px] rounded-l-full bg-gray-800" />
                    <div className="absolute -left-[2px] top-[200px] h-14 w-[2px] rounded-l-full bg-gray-800" />
                    <div className="absolute -right-[2px] top-[160px] h-20 w-[2px] rounded-r-full bg-gray-800" />
                    
                    {/* Dynamic Island */}
                    <div className="absolute left-1/2 top-3 z-30 h-[30px] w-[120px] -translate-x-1/2 rounded-full bg-black" />
                    
                    {/* Screen с правильным aspect ratio iPhone 14 Pro */}
                    <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.8rem] bg-white dark:bg-gray-950">
                      {/* Status bar */}
                      <div className="flex items-center justify-between px-6 pt-4 text-xs font-semibold text-gray-900 dark:text-white">
                        <span>9:41</span>
                        <div className="flex items-center gap-1.5">
                          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                          </svg>
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
                            <path d="M23 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </div>
                      </div>

                      {/* Content - более компактный */}
                      <div className="px-6 pb-8 pt-6">
                        {/* Main card */}
                        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 shadow-2xl">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-white/90">Today's Progress</span>
                            <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">Day 24</span>
                          </div>
                          <p className="mt-4 text-3xl font-bold text-white">On track 💪</p>
                          <p className="mt-2 text-sm font-medium text-white/95">1,540 cal • 104g protein • 8 glasses</p>
                          
                          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/25">
                            <div className="h-full w-[86%] rounded-full bg-white shadow-sm" />
                          </div>
                        </div>

                        {/* Small stats preview */}
                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-4 backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/60">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Weight</p>
                            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-50">68.2 kg</p>
                            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">-2.4 kg</p>
                          </div>
                          <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-4 backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/60">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Streak</p>
                            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-50">24 days</p>
                            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">🔥 Keep going!</p>
                          </div>
                        </div>
                      </div>

                      {/* Home indicator */}
                      <div className="absolute bottom-2 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-gray-900/20 dark:bg-white/20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Stats Section */}
      <section className="bg-surface py-12">
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

          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {valueProps.map((prop) => (
                <div
                  key={prop.title}
                  className="group rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:bg-card-hover"
                >
                  <div className="mb-4 text-4xl" aria-hidden="true">{prop.icon}</div>
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
              Powerful features, effortless experience
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-6xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featureHighlights.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:bg-card-hover"
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

          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-semibold text-white">
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">"{testimonial.content}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
          <div className="mt-12 space-y-3">
            {faqItems.map((item) => (
              <div
                key={item.id}
                id={item.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqId(openFaqId === item.id ? null : item.id)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left text-base font-semibold text-foreground transition-colors hover:bg-card-hover"
                >
                  {item.question}
                  <svg
                    className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
                      openFaqId === item.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaqId === item.id ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
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
                  to="/register"
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
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
