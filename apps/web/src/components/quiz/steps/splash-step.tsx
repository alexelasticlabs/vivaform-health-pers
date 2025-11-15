import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, Clock, TrendingUp } from 'lucide-react';
import { QuizCard } from '@/components/quiz';
import { Button } from '@/components/ui/button';

const MDiv = motion.div as any;

interface SplashStepProps {
  onStart: () => void;
}

export function SplashStep({ onStart }: SplashStepProps) {
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [usersToday] = useState(Math.floor(Math.random() * 1000) + 2000); // 2000-3000

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <MDiv
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-emerald-950 dark:via-neutral-950 dark:to-blue-950 p-4"
    >
      <div className="max-w-2xl w-full">
        <QuizCard
          title=""
          subtitle=""
          emoji=""
        >
          <div className="text-center space-y-8 py-8">
            {/* Main Title */}
            <MDiv
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex justify-center">
                <div className="relative">
                  <MDiv
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Sparkles className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
                  </MDiv>
                  <MDiv
                    className="absolute -top-2 -right-2"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  >
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                  </MDiv>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Discover Your
                <br />
                Personalized Plan
              </h1>

              <p className="text-xl text-neutral-600 dark:text-neutral-400">
                In just <span className="font-bold text-emerald-600">{minutes} minutes</span>
              </p>
            </MDiv>

            {/* Timer Display */}
            <MDiv
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="flex justify-center"
            >
              <div className="bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900 rounded-2xl px-8 py-4 inline-flex items-center gap-3">
                <Clock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <div className="text-3xl font-mono font-bold text-emerald-700 dark:text-emerald-300">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
              </div>
            </MDiv>

            {/* Features */}
            <MDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left"
            >
              {[
                { icon: '🎯', title: 'Personalized', desc: 'Tailored to your goals and lifestyle' },
                { icon: '🧬', title: 'Evidence-based', desc: 'Built with dietitian-approved methods' },
                { icon: '📊', title: 'Real results', desc: 'Track progress and stay motivated' },
              ].map((feature, idx) => (
                <MDiv
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                  className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800"
                >
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {feature.desc}
                  </p>
                </MDiv>
              ))}
            </MDiv>

            {/* Social Proof */}
            <MDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center justify-center gap-2 text-sm text-neutral-600 dark:text-neutral-400"
            >
              <Users className="h-4 w-4" />
              <span>
                <span className="font-bold text-emerald-600">{usersToday.toLocaleString()}</span> people completed today
              </span>
            </MDiv>

            {/* CTA Button */}
            <MDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <Button
                onClick={onStart}
                size="lg"
                className="w-full md:w-auto px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Start Now
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
              <p className="mt-3 text-xs text-neutral-500">
                Free • No sign-up • 5 minutes
              </p>
            </MDiv>
          </div>
        </QuizCard>
      </div>
    </MDiv>
  );
}
