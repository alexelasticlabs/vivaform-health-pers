export const useQuery = () => ({
  data: {
    nutrition: { summary: { calories: 0, protein: 0, fat: 0, carbs: 0 }, entries: [] },
    water: { totalMl: 0 },
    weight: { latest: { weightKg: 0 } },
    recommendations: []
  },
  isLoading: false
});
