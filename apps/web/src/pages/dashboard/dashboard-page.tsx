import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

import { fetchDailyDashboard, createWaterEntry } from "../../api";
import { fetchWeightHistory } from "../../api/weight";
import { getQuizProfile } from "../../api/quiz";
import { syncCheckoutSession } from "../../api/subscriptions";
import { useUserStore } from "../../store/user-store";

// New Widget Components
import { WelcomeSection } from "../../components/dashboard/welcome-section";
import { CaloriesWidget } from "../../components/dashboard/calories-widget";
import { MacrosWidget } from "../../components/dashboard/macros-widget";
import { WaterWidget } from "../../components/dashboard/water-widget";
import { WeightWidget } from "../../components/dashboard/weight-widget";
import { RecommendationsWidget } from "../../components/dashboard/recommendations-widget";
import { QuickAddWidget } from "../../components/dashboard/quick-add-widget";
import { WeeklyOverview } from "../../components/dashboard/weekly-overview";
import { QuickAddModal } from "../../components/dashboard/quick-add-modal";
import { AddNutritionFormWithAutocomplete } from "../../components/dashboard/add-nutrition-form-enhanced";
import { AddWeightForm } from "../../components/dashboard/add-weight-form";

export const DashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [modalState, setModalState] = useState<{ type: 'meal' | 'weight' | null; mealType?: string }>({ type: null });
  
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.profile);
  const isPremium = user?.tier === "PREMIUM";

  // Handle premium activation success
  useEffect(() => {
    const handlePremiumSuccess = async () => {
      if (searchParams.get('premium') === 'success') {
        const sessionId = searchParams.get('session_id');
        
        if (sessionId) {
          try {
            await syncCheckoutSession(sessionId);
            toast.success('🎉 VivaForm+ activated successfully! Welcome to premium!', {
              duration: 5000,
            });
            // Refresh user data to get updated tier
            queryClient.invalidateQueries({ queryKey: ['me'] });
          } catch (error) {
            console.error('Failed to sync subscription:', error);
            toast.error('Please refresh the page to see your premium status');
          }
        } else {
          toast.success('🎉 VivaForm+ activated successfully! Welcome to premium!', {
            duration: 5000,
          });
        }
        
        // Remove the query params
        searchParams.delete('premium');
        searchParams.delete('session_id');
        setSearchParams(searchParams, { replace: true });
      }
    };
    
    handlePremiumSuccess();
  }, [searchParams, setSearchParams, queryClient]);

  // Fetch dashboard data
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", selectedDate],
    queryFn: () => fetchDailyDashboard(selectedDate),
    staleTime: 30_000
  });

  // Fetch quiz profile for height/goals
  const { data: quizProfile } = useQuery({
    queryKey: ["quiz-profile"],
    queryFn: getQuizProfile,
    staleTime: 300_000
  });

  // Fetch weight history for trends
  const { data: weightHistory = [] } = useQuery({
    queryKey: ["weight-history"],
    queryFn: () => fetchWeightHistory({ limit: 14 }),
    staleTime: 60_000
  });

  // Water mutation
  const waterMutation = useMutation({
    mutationFn: createWaterEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", selectedDate] });
      toast.success("Water logged! 💧");
    },
    onError: () => {
      toast.error("Failed to log water");
    }
  });

  const handleAddWater = (amountMl: number) => {
    waterMutation.mutate({
      date: new Date().toISOString(),
      amountMl
    });
  };

  const openMealModal = (mealType: string) => {
    setModalState({ type: 'meal', mealType });
  };

  const openWeightModal = () => {
    setModalState({ type: 'weight' });
  };

  const closeModal = () => {
    setModalState({ type: null });
  };

  // Calculate goals (mock for now, should come from backend/quiz)
  // TODO: wire up recommended calories from quiz results when available in API response
  const calorieGoal = 2000;
  const proteinGoal = Math.round((calorieGoal * 0.3) / 4); // 30% of cals, 4 cal/g
  const fatGoal = Math.round((calorieGoal * 0.3) / 9); // 30% of cals, 9 cal/g
  const carbsGoal = Math.round((calorieGoal * 0.4) / 4); // 40% of cals, 4 cal/g
  const waterGoal = 2000; // ml

  // Generate weekly mock data (should come from backend)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toISOString().slice(0, 10),
      calories: Math.round(1500 + Math.random() * 800),
      protein: Math.round(60 + Math.random() * 40),
      fat: Math.round(40 + Math.random() * 30),
      carbs: Math.round(150 + Math.random() * 100),
    };
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 pb-20">
      {/* Welcome Section */}
      <WelcomeSection
        user={user!}
        streak={12}
        lastSync={new Date().toISOString()}
        subscriptionEndsAt={isPremium ? "2026-01-12" : null}
      />

      {/* Main Grid - 2 columns on desktop */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calories Widget */}
        <CaloriesWidget
          consumed={data?.nutrition.summary.calories || 0}
          goal={calorieGoal}
          entries={data?.nutrition.entries || []}
          onAddMeal={() => openMealModal('Breakfast')}
        />

        {/* Macros Widget */}
        <MacrosWidget
          protein={{ current: data?.nutrition.summary.protein || 0, goal: proteinGoal }}
          fat={{ current: data?.nutrition.summary.fat || 0, goal: fatGoal }}
          carbs={{ current: data?.nutrition.summary.carbs || 0, goal: carbsGoal }}
        />

        {/* Water Widget */}
        <WaterWidget
          consumed={data?.water.totalMl || 0}
          goal={waterGoal}
          onAddWater={handleAddWater}
        />

        {/* Weight & BMI Widget */}
        <WeightWidget
          latest={data?.weight.latest || null}
          history={weightHistory}
          heightCm={quizProfile?.heightCm}
          onAddWeight={openWeightModal}
        />

        {/* Recommendations Widget */}
        <RecommendationsWidget
          recommendations={data?.recommendations || []}
          isPremium={isPremium}
          updatedAt={data?.recommendations[0]?.createdAt}
        />

        {/* Quick Add Widget */}
        <QuickAddWidget onMealTypeSelect={openMealModal} />
      </div>

      {/* Weekly Overview - Full Width */}
      <WeeklyOverview data={weeklyData} goal={calorieGoal} />

      {/* Modals */}
      <QuickAddModal
        isOpen={modalState.type === 'meal'}
        onClose={closeModal}
        title={`Add ${modalState.mealType || 'Meal'}`}
      >
        <AddNutritionFormWithAutocomplete
          date={new Date().toISOString()}
          defaultMealType={modalState.mealType}
        />
      </QuickAddModal>

      <QuickAddModal
        isOpen={modalState.type === 'weight'}
        onClose={closeModal}
        title="Update Weight"
      >
        <AddWeightForm date={selectedDate} />
      </QuickAddModal>
    </div>
  );
};