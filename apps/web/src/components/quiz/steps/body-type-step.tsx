import { motion } from 'framer-motion';
import { useQuizStore } from '@/store/quiz-store';
import { QuizCard } from '@/components/quiz';
import { BODY_TYPES } from './enhanced-quiz-constants';
import { logQuizOptionSelected } from '@/lib/analytics';

export function BodyTypeStep() {
  const { answers, updateAnswers, clientId } = useQuizStore();

  const handleSelect = (typeId: string) => {
    updateAnswers({ bodyType: typeId });
    try {
      logQuizOptionSelected(clientId, 'body_type', 'bodyType', typeId);
    } catch {}
  };

  return (
    <QuizCard
      title="What is your body type?"
      subtitle="This helps us personalize calories and macros"
      helpText="Choose the one closest to your physique"
      emoji="🏋️"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BODY_TYPES.map((type, index) => (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
          >
            <button
              onClick={() => handleSelect(type.id)}
              className={`w-full p-6 rounded-2xl border-2 transition-all ${
                answers.bodyType === type.id
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 shadow-lg scale-105'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md'
              }`}
            >
              {/* Emoji Icon */}
              <div className="text-5xl mb-3">{type.emoji}</div>

              {/* Type Name */}
              <h3 className="font-bold text-lg mb-2">{type.title}</h3>

              {/* Description */}
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                {type.description}
              </p>

              {/* Characteristics */}
              <div className="space-y-1">
                {type.characteristics.map((char, idx) => (
                  <div
                    key={idx}
                    className="text-xs bg-white dark:bg-neutral-900 px-2 py-1 rounded"
                  >
                    • {char}
                  </div>
                ))}
              </div>

              {/* Selected Indicator */}
              {answers.bodyType === type.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-3 text-emerald-600 dark:text-emerald-400 font-semibold text-sm"
                >
                  ✓ Selected
                </motion.div>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {answers.bodyType && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-center"
        >
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Great! We’ll factor your body type into calorie and macro targets 💪
          </p>
        </motion.div>
      )}
    </QuizCard>
  );
}
