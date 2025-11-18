import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { logTestimonialsPageViewed, logTestimonialsCtaClicked } from '@/lib/analytics';

const TESTIMONIALS = [
  {
    name: 'Kara · lost 8 kg',
    quote:
      'Phase 1 killed the night snacking. The weekly recap emails make it impossible to ghost myself.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'Sam · down 2 sizes',
    quote:
      'The anti-inflammatory plan stopped the bloating in 10 days. I finally trust my hunger again.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'Andre · more energy',
    quote:
      'Macro recalculations after travel are clutch. I stay on track without feeling punished.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'Nina · consistent habits',
    quote:
      'The reminders feel like a coach who knows my day. It’s finally sustainable.',
    avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=200&auto=format&fit=crop',
  },
];

export function TestimonialsPage() {
  useEffect(() => {
    logTestimonialsPageViewed('direct');
  }, []);

  const handleCtaClick = () => {
    logTestimonialsCtaClicked('main_cta');
  };

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 text-emerald-900 shadow-inner">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Community wins</p>
        <h1 className="mt-2 text-2xl font-bold">Real members, real receipts</h1>
        <p className="mt-1 text-sm text-emerald-900/80">Screenshots, accountability threads, and before/afters from the VivaForm community.</p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className="rounded-3xl border border-emerald-100 bg-white/90 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <img src={t.avatar} alt={t.name} className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">{t.name}</p>
                <p className="text-xs text-emerald-900/70">Verified member story</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-emerald-900">“{t.quote}”</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
        <div>
          <p className="text-sm font-semibold text-emerald-900">Ready to start your plan?</p>
          <p className="text-xs text-emerald-900/80">Takes about 3 minutes. Personalized. Research-backed.</p>
        </div>
        <Link 
          to="/quiz" 
          onClick={handleCtaClick}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
        >
          Take the Quiz →
        </Link>
      </div>
    </div>
  );
}

export default TestimonialsPage;
