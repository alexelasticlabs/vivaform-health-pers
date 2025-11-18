import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RefreshCw, Scale, Target, Utensils } from 'lucide-react';
import { getQuizProfile, updateQuizProfile } from '../api';
import { useNavigate } from 'react-router-dom';
import type { QuizAnswers } from '../api';

type UnitSystem = 'metric' | 'imperial';

export function MyPlanPage() {
  const navigate = useNavigate();
  
  // Unit system preference
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  
  // Form state
  const [formData, setFormData] = useState<QuizAnswers>({});
  
  // Fetch quiz profile
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['quizProfile'],
    queryFn: getQuizProfile,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateQuizProfile,
    onSuccess: async () => {
      toast.success('Your plan has been updated! ✨');
      await refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update plan');
    },
  });

  // Initialize form data
  useEffect(() => {
    if (profile?.answers) {
      setFormData(profile.answers);
    }
  }, [profile]);

  // Calculate BMI
  const bmi = useMemo(() => {
    if (!profile?.bmi) return null;
    
    let category: string;
    let color: string;
    
    if (profile.bmi < 18.5) {
      category = 'Underweight';
      color = 'text-blue-600 bg-blue-50';
    } else if (profile.bmi < 25) {
      category = 'Normal 👌🏼';
      color = 'text-green-600 bg-green-50';
    } else if (profile.bmi < 30) {
      category = 'Overweight';
      color = 'text-yellow-600 bg-yellow-50';
    } else {
      category = 'Obese';
      color = 'text-red-600 bg-red-50';
    }
    
    return { value: profile.bmi, category, color };
  }, [profile?.bmi]);

  // (Unit conversion helpers can be added on-demand when UI requires them)

  // Handle form updates
  const handleUpdate = (section: keyof QuizAnswers, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...(prev[section] as object || {}), ...data },
    }));
  };

  const handleSave = () => {
    updateMutation.mutate({ answers: formData });
  };

  const handleRetakeQuiz = () => {
    navigate('/quiz');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-gray-600 mb-4">No quiz profile found.</p>
        <button
          onClick={() => navigate('/quiz')}
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold"
        >
          Take Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            My Plan
          </h1>
          <p className="text-gray-600 mt-1">Manage your health and nutrition goals</p>
        </div>
        <button
          onClick={handleRetakeQuiz}
          className="flex items-center gap-2 px-4 py-2 border-2 border-emerald-600 text-emerald-600 rounded-xl font-medium hover:bg-emerald-50 transition-colors"
        >
          <RefreshCw size={16} />
          Retake Quiz
        </button>
      </div>

      {/* BMI Card */}
      {bmi && (
        <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${bmi.color}`}>
              <Scale size={32} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Your BMI</p>
              <p className="text-4xl font-bold text-gray-900">{bmi.value.toFixed(1)}</p>
              <p className="text-lg font-semibold mt-1">{bmi.category}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Height</p>
              <p className="text-xl font-semibold">{profile.heightCm?.toFixed(0)} cm</p>
              <p className="text-sm text-gray-600 mt-2">Weight</p>
              <p className="text-xl font-semibold">{profile.weightKg?.toFixed(1)} kg</p>
            </div>
          </div>
        </div>
      )}

      {/* Unit System Toggle */}
      <div className="p-4 bg-white rounded-xl border border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">Unit System</p>
        <div className="flex gap-2">
          <button
            onClick={() => setUnitSystem('metric')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              unitSystem === 'metric'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Metric (cm / kg)
          </button>
          <button
            onClick={() => setUnitSystem('imperial')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              unitSystem === 'imperial'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Imperial (ft / lb)
          </button>
        </div>
      </div>

      {/* Diet Plan */}
      <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Utensils className="text-emerald-600" size={24} />
          <h2 className="text-xl font-bold">Diet Plan</h2>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dietary Preference
          </label>
          <select
            value={(formData.diet?.plan as string) || ''}
            onChange={(e) => handleUpdate('diet', { plan: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Select a plan</option>
            <option value="Mediterranean">Mediterranean</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Vegan">Vegan</option>
            <option value="Keto">Keto</option>
            <option value="Paleo">Paleo</option>
            <option value="Balanced">Balanced</option>
          </select>
        </div>
      </div>

      {/* Goals */}
      <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Target className="text-emerald-600" size={24} />
          <h2 className="text-xl font-bold">Goals</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['lose', 'maintain', 'gain'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleUpdate('goals', { type })}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      (formData.goals?.type as string) === type
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Weight</label>
            <input
              type="number"
              min={30}
              max={300}
              step={0.1}
                value={(formData.targetWeightKg as any) ?? ''}
              onChange={(e) => handleUpdate('targetWeightKg' as any, Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g. 65"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meals per day</label>
            <div className="grid grid-cols-4 gap-2">
              {[2,3,4,5].map((n) => (
                <button
                  key={n}
                  onClick={() => handleUpdate('mealsPerDay' as any, n)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    (formData as any).mealsPerDay === n
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  type="button"
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
