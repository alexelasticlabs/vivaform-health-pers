import { motion } from 'framer-motion';
import { useState } from 'react';
import { PartyPopper, CheckCircle, TrendingUp, Clock, Mail, Shield } from 'lucide-react';
import { useQuizStore } from '@/store/quiz-store';
import { QuizCard } from '@/components/quiz';
import { calculateBMI } from '@/store/quiz-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { captureQuizEmail } from '@/api/quiz';

const MDiv = motion.div as any;

export function MidpointCelebrationStep() {
  const { answers, updateAnswers, currentStep, clientId } = useQuizStore();
  const [email, setEmail] = useState(answers.email || '');
  const [emailSaved, setEmailSaved] = useState(!!answers.email);
  const [isSaving, setIsSaving] = useState(false);

  const bmi = calculateBMI(answers);
  const goal = answers.primaryGoal;

  const goalText = goal === 'lose_weight'
    ? 'Lose weight'
    : goal === 'gain_muscle'
    ? 'Build muscle'
    : goal === 'more_energy'
    ? 'Gain more energy'
    : 'Stay healthy';

  const completedItems = [
    { text: `Your goal: ${goalText}`, icon: CheckCircle },
    bmi ? { text: `Current BMI: ${bmi.bmi}`, icon: CheckCircle } : null,
    { text: `Food preferences collected`, icon: CheckCircle },
    { text: `Cooking skills assessed`, icon: CheckCircle },
  ].filter(Boolean);

  const handleSaveEmail = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsSaving(true);
    try {
      await captureQuizEmail({
        email,
        clientId,
        step: currentStep,
        type: 'midpoint'
      });
      
      updateAnswers({ email });
      setEmailSaved(true);
      toast.success('Great! Your progress is saved 🎉');
    } catch {
      updateAnswers({ email });
      setEmailSaved(true);
      toast.success('Progress saved locally 🎉');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MDiv
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <QuizCard
        title=""
        subtitle=""
        emoji=""
      >
        <div className="text-center space-y-6 py-8">
          {/* Confetti Icon */}
          <MDiv
            animate={{
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.2, 1, 1.2, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: 2,
            }}
            className="flex justify-center"
          >
            <div className="relative">
              <PartyPopper className="h-20 w-20 text-emerald-600 dark:text-emerald-400" />
              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <MDiv
                  key={i}
                  className="absolute w-2 h-2 bg-emerald-500 rounded-full"
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos(i * 60 * Math.PI / 180) * 50,
                    y: Math.sin(i * 60 * Math.PI / 180) * 50,
                    opacity: 0,
                  }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              ))}
            </div>
          </MDiv>

          {/* Main Message */}
          <MDiv
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Great job! You're halfway there! 🎉
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Here's what we've learned so far
            </p>
          </MDiv>

          {/* Progress Bar */}
          <MDiv
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="relative h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
              50%
            </div>
          </MDiv>

          {/* Completed Items */}
          <MDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-3 max-w-md mx-auto"
          >
            {completedItems.map((item: any, index) => (
              <MDiv
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg"
              >
                <item.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-sm font-medium text-left">{item.text}</span>
              </MDiv>
            ))}
          </MDiv>

          {/* Email Capture Section */}
          {!emailSaved && (
            <MDiv
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="max-w-md mx-auto p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-2xl border-2 border-blue-200 dark:border-blue-800"
            >
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-blue-500 rounded-full">
                  <Mail className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-blue-900 dark:text-blue-100">
                Save your progress!
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                Enter your email to save your answers and get your personalized plan delivered
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isSaving && handleSaveEmail()}
                  className="flex-1"
                  disabled={isSaving}
                />
                <Button
                  onClick={handleSaveEmail}
                  disabled={isSaving || !email}
                  className="px-6"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-blue-600 dark:text-blue-400">
                <Shield className="w-3 w-3" />
                <span>We protect your privacy. No spam, ever.</span>
              </div>
            </MDiv>
          )}

          {emailSaved && (
            <MDiv
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md mx-auto p-4 bg-emerald-50 dark:bg-emerald-950 rounded-xl border border-emerald-200 dark:border-emerald-800"
            >
              <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Progress saved! ✓</span>
              </div>
            </MDiv>
          )}

          {/* Encouragement */}
          <MDiv
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: emailSaved ? 1.5 : 1.8 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900 rounded-full">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Just 2–3 more minutes to get your perfect plan!
              </span>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Only a few lifestyle questions left
              <br />
              and your personalized plan will be ready! 🚀
            </p>

            <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
              <TrendingUp className="h-4 w-4" />
              <span>You've got this! Keep going 💪</span>
            </div>
          </MDiv>
        </div>
      </QuizCard>
    </MDiv>
  );
}

