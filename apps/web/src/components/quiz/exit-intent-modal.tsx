import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ExitIntentModalProps {
  currentStep: number;
  totalSteps: number;
  onSave?: (email: string) => Promise<void> | void;
  onClose: () => void;
}

const MDiv = motion.div as any;

export function ExitIntentModal({ currentStep, totalSteps, onSave, onClose }: ExitIntentModalProps) {
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = Math.round((currentStep / totalSteps) * 100);

  const handleSave = async () => {
    const trimmed = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      if (onSave) {
        await onSave(trimmed);
      }
      setSaved(true);
      setTimeout(onClose, 2000);
    } catch {
      setError('Could not save your progress. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <MDiv
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-2xl font-bold mb-2">Progress saved!</h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            We'll send you a reminder to complete your plan.
          </p>
        </MDiv>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <MDiv
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="text-4xl mb-3">😊</div>
          <h3 className="text-2xl font-bold mb-2">Don't leave yet!</h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            You've already completed <strong>{progress}%</strong> of your personalized plan
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-4 text-sm">
            <p className="font-semibold mb-1">Save your progress</p>
            <p className="text-neutral-600 dark:text-neutral-400">
              Enter your email and we'll save your answers so you can continue anytime
            </p>
          </div>

          <div className="space-y-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && !isSaving && handleSave()}
              disabled={isSaving}
            />
            {error && (
              <p className="text-sm font-medium text-rose-600">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSaving}>
              Continue quiz
            </Button>
            <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save & exit'}
            </Button>
          </div>
        </div>
      </MDiv>
    </div>
  );
}
