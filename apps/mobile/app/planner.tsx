import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { MEAL_TYPES } from "@vivaform/shared";

import {
  createNutritionEntry,
  createWaterEntry,
  fetchDailyDashboard
} from "../src/api/dashboard";
import { useUserStore } from "../src/store/user-store";

export default function PlannerScreen() {
  const { isAuthenticated } = useUserStore((state) => ({
    isAuthenticated: state.isAuthenticated
  }));
  const queryClient = useQueryClient();
  const [mealType, setMealType] = useState<string>(MEAL_TYPES[0]);
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("0");
  const [protein, setProtein] = useState("0");
  const [fat, setFat] = useState("0");
  const [carbs, setCarbs] = useState("0");
  const [waterAmount, setWaterAmount] = useState("250");

  const selectedDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated]);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-mobile", selectedDate],
    queryFn: () => fetchDailyDashboard(selectedDate),
    enabled: isAuthenticated
  });

  const nutritionMutation = useMutation({
    mutationFn: createNutritionEntry,
    onSuccess: async () => {
      setFood("");
      setCalories("0");
      setProtein("0");
      setFat("0");
      setCarbs("0");
      setMealType(MEAL_TYPES[0]);
      Alert.alert("Готово", "Приём пищи добавлен");
      await queryClient.invalidateQueries({ queryKey: ["dashboard-mobile"] });
    },
    onError: () => Alert.alert("Ошибка", "Не удалось сохранить запись питания")
  });

  const waterMutation = useMutation({
    mutationFn: createWaterEntry,
    onSuccess: async () => {
      setWaterAmount("250");
      Alert.alert("Готово", "Запись по воде сохранена");
      await queryClient.invalidateQueries({ queryKey: ["dashboard-mobile"] });
    },
    onError: () => Alert.alert("Ошибка", "Не удалось сохранить запись по воде")
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Дневник VivaForm</Text>
      <Text style={styles.description}>
        Добавляйте приёмы пищи и воду, чтобы получать свежие рекомендации VivaForm+. Все данные синхронизируются с веб-версией.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Добавить питание</Text>
        <View style={styles.mealTypeRow}>
          {MEAL_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.mealTypeButton, mealType === type && styles.mealTypeButtonActive]}
              onPress={() => setMealType(type)}
            >
              <Text style={[styles.mealTypeButtonText, mealType === type && styles.mealTypeButtonTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.formRow}>
          <TextInput
            style={styles.input}
            value={food}
            onChangeText={setFood}
            placeholder="Что ели"
          />
        </View>
        <View style={styles.formRow}>
          <TextInput
            style={styles.input}
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
            placeholder="Ккал"
          />
          <TextInput
            style={styles.input}
            value={protein}
            onChangeText={setProtein}
            keyboardType="numeric"
            placeholder="Белки"
          />
          <TextInput
            style={styles.input}
            value={fat}
            onChangeText={setFat}
            keyboardType="numeric"
            placeholder="Жиры"
          />
          <TextInput
            style={styles.input}
            value={carbs}
            onChangeText={setCarbs}
            keyboardType="numeric"
            placeholder="Углеводы"
          />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            nutritionMutation.mutate({
              date: new Date().toISOString(),
              mealType,
              food,
              calories: Number(calories),
              protein: Number(protein),
              fat: Number(fat),
              carbs: Number(carbs)
            })
          }
        >
          <Text style={styles.buttonText}>Добавить питание</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Добавить воду</Text>
          <View style={styles.formRow}>
            <TextInput
              style={styles.input}
              value={waterAmount}
              onChangeText={setWaterAmount}
              keyboardType="numeric"
              placeholder="мл"
            />
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              waterMutation.mutate({
                date: new Date().toISOString(),
                amountMl: Number(waterAmount)
              })
            }
          >
            <Text style={styles.buttonText}>Добавить воду</Text>
          </TouchableOpacity>
        </View>

        {/* Dashboard summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Сводка</Text>
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <View>
              <Text>Калории: {data?.nutrition.summary.calories ?? 0}</Text>
              <Text>Вода: {data?.water.totalMl ?? 0} мл</Text>
              <Text>Вес: {data?.weight.latest?.weightKg ?? '-'} кг</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  description: { color: "#6b7280", marginBottom: 16 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  mealTypeRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  mealTypeButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: "#e5e7eb" },
  mealTypeButtonActive: { backgroundColor: "#10b981" },
  mealTypeButtonText: { color: "#374151" },
  mealTypeButtonTextActive: { color: "white" },
  formRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, padding: 8 },
  button: { backgroundColor: "#10b981", padding: 12, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "600" }
});