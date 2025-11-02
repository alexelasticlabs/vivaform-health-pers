import { Link } from "react-router-dom";

import { SUBSCRIPTION_PLANS } from "@vivaform/shared";

import { trackConversion } from "../lib/analytics";
import { useIntersectionObserver } from "../hooks/use-intersection-observer";

type FeatureHighlight = {
  title: string;
  description: string;
};

const featureHighlights: FeatureHighlight[] = [
  {
    title: "Your personal nutrition coach",
    description:
      "VivaForm analyzes your daily diary and reveals exactly what's missing—no guesswork, no restrictive diets, just clear guidance."
  },
  {
    title: "Habits that actually stick",
    description:
      "Gentle reminders, visual streaks, and quick check-ins turn good intentions into lasting routines you can count on."
  },
  {
    title: "Ready-made meal plans",
    description:
      "Get a week's worth of personalized meals in seconds—matched to your goals, taste preferences, and lifestyle."
  }
];

type JourneyStep = {
  title: string;
  description: string;
  detail: string;
};

const journeySteps: JourneyStep[] = [
  {
    title: "Discover your personalized plan",
    description: "Just 5 minutes",
    detail: "Answer 40 science-backed questions and watch VivaForm craft a wellness plan that fits your life, not someone else's template."
  },
  {
    title: "See your roadmap instantly",
    description: "No waiting around",
    detail:
      "Get your calorie target, macro breakdown, and a clear weekly action plan—all customized the moment you finish the quiz."
  },
  {
    title: "Build momentum daily",
    description: "Web + iOS + Android",
    detail:
      "Quick logging, smart reminders, and real-time progress charts keep you motivated and on track wherever you are."
  }
];

type PlatformHighlight = {
  title: string;
  badge: string;
  description: string;
};

const platformHighlights: PlatformHighlight[] = [
  {
    title: "Web dashboard",
    badge: "New UI",
    description: "Dive into detailed analytics, manage your subscription, and review recommendations from any browser."
  },
  {
    title: "iOS app",
    badge: "On the App Store",
    description: "Home-screen widgets, daily reminders, and Apple Health sync to keep your plan top of mind."
  },
  {
    title: "Android app",
    badge: "On Google Play",
    description: "Offline logging, Google Fit sync, and instant OTA updates powered by Expo."
  }
];

type PricingTier = {
  name: string;
  price: string;
  description: string;
  highlight?: boolean;
  features: string[];
};

const freeTier: PricingTier = {
  name: "Free",
  price: "$0",
  description: "Core tracking tools for mindful nutrition",
  features: [
    "Profile with goals and daily targets",
    "Meal and water diary",
    "7-day weight chart",
    "Smart reminders for meals"
  ]
};

const vivaformPlusFeatures: string[] = [
  "Goal-based meal planner",
  "Advanced analytics and reports",
  "PDF/CSV exports",
  "Apple Health & Google Fit sync"
];

const pricingTiers: PricingTier[] = [
  freeTier,
  ...SUBSCRIPTION_PLANS.map((plan) => ({
    name: `VivaForm+ · ${plan.title}`,
    price: plan.price,
    description: plan.description,
    highlight: plan.plan === "annual",
    features: vivaformPlusFeatures
  }))
];

const faqItems = [
  {
    question: "Do I need a credit card to get started?",
    answer: "Not at all! Take the quiz and explore the free version as long as you like. Upgrade to premium features whenever you're ready."
  },
  {
    question: "Is there a trial for the premium plan?",
    answer:
      "Yes! Try VivaForm+ free for 7 days. Stripe only bills after the trial ends, so you can cancel anytime without charges."
  },
  {
    question: "How does VivaForm give recommendations without AI?",
    answer:
      "Our algorithms analyze your diary, goals, and progress patterns to highlight gaps and suggest practical next steps—no external AI needed."
  },
  {
    question: "Can I download my data?",
    answer: "Absolutely. VivaForm+ members can export everything to PDF or CSV, plus create secure data backups anytime."
  }
];

const heroStats = [
  { label: "People who finished the quiz", value: "25,000+" },
  { label: "Average weight change", value: "-3.4 kg in 30 days" },
  { label: "Habit retention", value: "86% keep logging" }
];

export const LandingPage = () => {
  const handleStartClick = () => trackConversion("start_quiz_click", { placement: "hero" });
  const handlePricingClick = (plan: string) => trackConversion("pricing_cta_click", { plan });

  const [journeyRef, journeyVisible] = useIntersectionObserver({ threshold: 0.1, freezeOnceVisible: true });
  const [featuresRef, featuresVisible] = useIntersectionObserver({ threshold: 0.1, freezeOnceVisible: true });
  const [platformRef, platformVisible] = useIntersectionObserver({ threshold: 0.1, freezeOnceVisible: true });
  const [pricingRef, pricingVisible] = useIntersectionObserver({ threshold: 0.1, freezeOnceVisible: true });

  return (
    <main className="overflow-hidden">
      <section className="relative isolate">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-16 pt-20 text-center md:flex-row md:items-center md:text-left">
          <div className="md:w-1/2">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Science-backed wellness
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
              Transform your health with a plan that's actually yours
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              No cookie-cutter diets. No confusing jargon. Just a personalized path to lasting change—starting with a 5-minute quiz.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                onClick={handleStartClick}
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/40 active:translate-y-0"
              >
                Get your free plan now
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-muted hover:border-muted-foreground/20"
              >
                Log in
              </Link>
            </div>
            <dl className="mt-10 grid gap-4 text-left text-sm text-muted-foreground sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd className="mt-2 text-base font-semibold text-foreground">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative md:w-1/2">
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] bg-gradient-to-br from-primary/30 via-emerald-200/40 to-transparent blur-3xl" aria-hidden />
            <div className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-xl">
              <div className="grid grid-cols-2 gap-4 text-left text-sm">
                <div className="rounded-2xl bg-primary/10 p-4">
                  <p className="text-xs text-muted-foreground">Today</p>
                  <p className="mt-2 text-2xl font-semibold">1,540 kcal</p>
                  <p className="text-xs text-muted-foreground">160 kcal below target</p>
                </div>
                <div className="rounded-2xl bg-emerald-100/40 p-4">
                  <p className="text-xs text-emerald-700">Progress</p>
                  <p className="mt-2 text-2xl font-semibold">-3.4 kg</p>
                  <p className="text-xs text-emerald-700">in 28 days with VivaForm</p>
                </div>
                <div className="rounded-2xl bg-background p-4 shadow-sm">
                  <p className="text-xs text-muted-foreground">Protein</p>
                  <p className="mt-2 text-lg font-semibold">92 g</p>
                  <p className="text-xs text-muted-foreground">12 g above goal</p>
                </div>
                <div className="rounded-2xl bg-background p-4 shadow-sm">
                  <p className="text-xs text-muted-foreground">Water</p>
                  <p className="mt-2 text-lg font-semibold">2.1 L</p>
                  <p className="text-xs text-muted-foreground">Reminder at 5:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="journey" className="bg-surface/60 py-16" ref={journeyRef}>
        <div
          className={`mx-auto max-w-5xl px-6 transition-all duration-700 ${
            journeyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-center text-3xl font-semibold tracking-tight">How VivaForm drives lasting change</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {journeySteps.map((step, index) => (
              <article
                key={step.title}
                className="relative rounded-3xl border border-border/60 bg-background p-6 shadow-sm transition-all duration-500"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <span className="absolute -top-5 left-6 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg">
                  {index + 1}
                </span>
                <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">{step.description}</p>
                <p className="mt-4 text-sm text-muted-foreground">{step.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-background/80 py-16" ref={featuresRef}>
        <div
          className={`mx-auto max-w-5xl px-6 transition-all duration-700 ${
            featuresVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-center text-3xl font-semibold tracking-tight">Built for measurable progress</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {featureHighlights.map((feature, index) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-border/70 bg-surface/60 p-6 shadow-sm transition-all duration-500 hover:shadow-lg hover:-translate-y-1"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="app" className="bg-surface py-16" ref={platformRef}>
        <div
          className={`mx-auto max-w-6xl px-6 transition-all duration-700 ${
            platformVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Cross-platform
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">VivaForm is always with you</h2>
              <p className="mt-4 text-sm text-muted-foreground">
                Web and mobile stay in sync in real time. Log meals on the go, then review deep analytics from your laptop at night.
              </p>
              <ul className="mt-6 space-y-4 text-sm">
                {platformHighlights.map((platform) => (
                  <li key={platform.title} className="rounded-3xl border border-border/60 bg-background px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold">{platform.title}</h3>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{platform.badge}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{platform.description}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative flex justify-center">
              <div className="pointer-events-none absolute -inset-12 -z-10 rounded-[48px] bg-gradient-to-br from-primary/20 via-emerald-200/30 to-transparent blur-3xl" aria-hidden />
              <div className="grid w-full max-w-md gap-4">
                <div className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-xl">
                  <h3 className="text-base font-semibold">Weekly analytics</h3>
                  <p className="mt-2 text-xs text-muted-foreground">Compare consumed vs burned calories and spot trends for the last 7 days.</p>
                </div>
                <div className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-xl">
                  <h3 className="text-base font-semibold">Hydration reminders</h3>
                  <p className="mt-2 text-xs text-muted-foreground">Set the cadence once and let VivaForm nudge you before you fall behind.</p>
                </div>
                <div className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-xl">
                  <h3 className="text-base font-semibold">Personalised tips</h3>
                  <p className="mt-2 text-xs text-muted-foreground">If protein is low, we suggest concrete swaps and meals to close the gap.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-background py-16" ref={pricingRef}>
        <div
          className={`mx-auto max-w-6xl px-6 transition-all duration-700 ${
            pricingVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl font-semibold tracking-tight">Pick the plan that fits your pace</h2>
          <p className="mt-3 text-muted-foreground">
            Upgrade to VivaForm+ to unlock the meal planner, advanced analytics, exports, and integrations.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {pricingTiers.map((tier) => (
              <article
                key={tier.name}
                className={`rounded-3xl border border-border/70 bg-background p-8 text-left shadow-lg ${
                  tier.highlight ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-semibold">{tier.name}</h3>
                  <span className="text-2xl font-semibold">{tier.price}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{tier.description}</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  onClick={() => handlePricingClick(tier.name)}
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                    tier.highlight
                      ? "bg-primary text-primary-foreground shadow-lg hover:-translate-y-1 hover:shadow-xl"
                      : "border border-border text-foreground hover:bg-muted hover:border-muted-foreground/20"
                  }`}
                >
                  {tier.price === "$0" ? "Start for free" : "Try VivaForm+"}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-surface/80 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="mt-10 space-y-4">
            {faqItems.map((item) => (
              <details key={item.question} className="rounded-3xl border border-border/70 bg-background px-6 py-5 shadow-sm">
                <summary className="cursor-pointer text-base font-semibold">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="cta" className="bg-background pb-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-3xl border border-border/70 bg-surface px-10 py-12 text-center shadow-xl">
          <span className="rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ready for lasting change?
          </span>
          <h2 className="text-3xl font-semibold tracking-tight">Your wellness journey starts today</h2>
          <p className="text-sm text-muted-foreground">
            Begin with our free tools to build momentum. When you're ready for advanced insights and meal plans, upgrade in one click.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              onClick={() => trackConversion("start_quiz_click", { placement: "cta" })}
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/40 active:translate-y-0"
            >
              Get your plan now
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-muted hover:border-muted-foreground/20"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};