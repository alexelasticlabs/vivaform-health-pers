import { QuizCard } from '@/components/quiz';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, Users, TrendingUp, Lock, Clock, CheckCircle, Star } from 'lucide-react';

const MDiv = motion.div as any;

export function FinalCTAStep({ onContinue }: { onContinue: () => void }) {
  return (
    <QuizCard
      title=""
      subtitle=""
      emoji=""
    >
      <div className="space-y-6 py-4">
        {/* Hero Section */}
        <MDiv
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="inline-block p-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            You're One Step Away! 🎉
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-2">
            Join <strong className="text-emerald-600">50,000+ people</strong> transforming their health with VivaForm
          </p>
        </MDiv>

        {/* Social Proof - Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MDiv
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-xl border border-emerald-200 dark:border-emerald-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-sm italic text-neutral-700 dark:text-neutral-300 mb-2">
              "Lost 12 kg in 3 months! The meal plans are so easy to follow and delicious. Finally a program that works!"
            </p>
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              — Anna K., 32, Moscow
            </p>
          </MDiv>

          <MDiv
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-sm italic text-neutral-700 dark:text-neutral-300 mb-2">
              "I have so much energy now! No more afternoon crashes. The personalized approach makes all the difference."
            </p>
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              — Michael D., 28, St. Petersburg
            </p>
          </MDiv>
        </div>

        {/* What You Get */}
        <MDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 shadow-lg"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            <span>Unlock Your Full Plan</span>
          </h3>
          <div className="space-y-3">
            {[
              'Personalized meal plans based on your answers',
              'Daily calorie & macro targets for your goal',
              'Step-by-step recipes (beginner-friendly)',
              'Progress tracking & weight logging',
              'Water intake reminders',
              'Community support & accountability'
            ].map((benefit, idx) => (
              <MDiv
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">{benefit}</span>
              </MDiv>
            ))}
          </div>
        </MDiv>

        {/* Urgency Banner */}
        <MDiv
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 rounded-xl border border-amber-300 dark:border-amber-700"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100">
                🔥 Limited Time: Free for the first month!
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Join now and get premium features at no cost for 30 days. Cancel anytime.
              </p>
            </div>
          </div>
        </MDiv>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <MDiv
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center p-4 bg-emerald-50 dark:bg-emerald-950 rounded-xl"
          >
            <Users className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-600">50k+</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Active Users</p>
          </MDiv>
          <MDiv
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-xl"
          >
            <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">4.8★</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Rating</p>
          </MDiv>
          <MDiv
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-xl"
          >
            <CheckCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">92%</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Success Rate</p>
          </MDiv>
        </div>

        {/* Primary CTA */}
        <MDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="text-center space-y-3"
        >
          <Button
            size="lg"
            onClick={onContinue}
            className="w-full md:w-auto px-12 py-6 text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105"
          >
            Get My Full Plan Now →
          </Button>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            ✓ Free for 30 days · ✓ No credit card required · ✓ Cancel anytime
          </p>
        </MDiv>

        {/* Trust badges */}
        <MDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex items-center justify-center gap-4 text-xs text-neutral-500 pt-4 border-t border-neutral-200 dark:border-neutral-800"
        >
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Secure & Private
          </span>
          <span>·</span>
          <span>GDPR Compliant</span>
          <span>·</span>
          <span>Money-back Guarantee</span>
        </MDiv>
      </div>
    </QuizCard>
  );
}

