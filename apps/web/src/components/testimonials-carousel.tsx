import { useState, useEffect, useMemo } from "react";

type Testimonial = {
  id: number;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Lost 15kg in 4 months",
    avatar: "SM",
    content:
      "VivaForm completely changed my relationship with food. The personalized recommendations helped me understand what my body actually needs. I've never felt this energized!",
    rating: 5
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "Marathon runner",
    avatar: "MR",
    content:
      "As an athlete, tracking my macros was always a hassle. VivaForm makes it effortless and the meal planner saves me hours every week. Game changer!",
    rating: 5
  },
  {
    id: 3,
    name: "Emily Chen",
    role: "Busy working mom",
    avatar: "EC",
    content:
      "Finally, an app that fits into my chaotic schedule. Quick logging, smart reminders, and meal plans that work for my whole family. Absolutely worth it!",
    rating: 5
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Gained 8kg muscle",
    avatar: "DT",
    content:
      "The analytics helped me dial in my protein intake perfectly. I've seen better gains in 3 months with VivaForm than I did in a year of guessing.",
    rating: 5
  },
  {
    id: 5,
    name: "Lisa Patel",
    role: "Type 2 diabetes management",
    avatar: "LP",
    content:
      "My doctor recommended tracking my food, and VivaForm made it simple. My A1C has improved significantly and I feel in control of my health again.",
    rating: 5
  }
];

export const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const visibleTestimonials = useMemo(
    () =>
      Array.from({ length: 3 }, (_, offset) => testimonials[(currentIndex + offset) % testimonials.length]),
    [currentIndex]
  );

  useEffect(() => {
    if (isPaused) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [isPaused]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div
      className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 p-8 shadow-xl ring-1 ring-gray-200/50 transition-all dark:from-gray-900 dark:via-emerald-950/20 dark:to-teal-950/20 dark:ring-gray-800/50"
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
      aria-live="polite"
    >
      {/* Decorative background elements */}
      <div className="absolute -left-20 top-1/3 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-24 bottom-1/4 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" aria-hidden="true" />

      <div className="relative">
        <div className="grid gap-6 md:grid-cols-3">
          {visibleTestimonials.map((testimonial, index) => (
            <article
              key={`${testimonial.id}-${index}`}
              className="group/card relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-md shadow-emerald-500/5 ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/50"
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
              
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-semibold text-white shadow-lg shadow-emerald-500/30">
                  {testimonial.avatar}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{testimonial.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1">
                {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                  <svg
                    key={starIndex}
                    className="h-4 w-4 fill-amber-400"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="mt-5 grow text-base leading-relaxed text-foreground">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Decorative corner accent */}
              <div className="absolute right-4 top-4 h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 blur-2xl" aria-hidden="true" />
            </article>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2.5">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.id}
              onClick={() => handleDotClick(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? "w-10 bg-gradient-to-r from-emerald-600 to-teal-600 shadow-sm shadow-emerald-500/50" 
                  : "w-2.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
              }`}
              aria-label={`Go to testimonial ${testimonial.name}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
