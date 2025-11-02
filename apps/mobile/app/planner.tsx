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
    onSuccess: () => {
      setFood("");
      setCalories("0");
      setProtein("0");
      setFat("0");
      setCarbs("0");
      setMealType(MEAL_TYPES[0]);
      Alert.alert("Готово", "Приём пищи добавлен");
      queryClient.invalidateQueries({ queryKey: ["dashboard-mobile"] });
    },
    onError: () => Alert.alert("Ошибка", "Не удалось сохранить запись питания")
  });

  const waterMutation = useMutation({
    mutationFn: createWaterEntry,
    onSuccess: () => {
      setWaterAmount("250");
      Alert.alert("Готово", "Запись по воде сохранена");
      queryClient.invalidateQueries({ queryKey: ["dashboard-mobile"] });
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
              mealType,
              food,
              calories: Number(calories),
              protein: Number(protein),
              fat: Number(fat),
              carbs: Number(carbs),
              date: selectedDate
            })
          }
          disabled={nutritionMutation.isPending}
        >
          <Text style={styles.buttonText}>
            {nutritionMutation.isPending ? "Сохраняем…" : "Добавить приём пищи"}
          </Text>
        </TouchableOpacity>
      </View>

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
              amountMl: Number(waterAmount),
              date: `${selectedDate}T${new Date().toISOString().slice(11, 19)}`
            })
          }
          disabled={waterMutation.isPending}
        >
          <Text style={styles.buttonText}>
            {waterMutation.isPending ? "Добавляем…" : "Зафиксировать воду"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Сегодня</Text>
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#1FA97D" />
          </View>
        ) : data ? (
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              Калории: {data.nutrition.summary.calories} ккал • Вода: {data.water.totalMl} мл
            </Text>
            <Text style={styles.summaryText}>
              Последний вес: {data.weight.latest ? `${data.weight.latest.weightKg} кг` : "нет данных"}
            </Text>
            <Text style={styles.summaryText}>
              Рекомендаций: {data.recommendations.length}
            </Text>
          </View>
        ) : (
          <Text style={styles.summaryText}>Данные ещё не загружены.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 20
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0A2E23"
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    color: "#35524A"
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0A2E23"
  },
  formRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap"
  },
  input: {
    flexGrow: 1,
    minWidth: 100,
    backgroundColor: "#F4FBF5",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#D5E9D9"
  },
  button: {
    backgroundColor: "#1FA97D",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center"
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15
  },
  loading: {
    alignItems: "center",
    paddingVertical: 12
  },
  summary: {
    gap: 6
  },
  summaryText: {
    fontSize: 14,
    color: "#35524A"
  },
  mealTypeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  mealTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D5E9D9",
    backgroundColor: "#F4FBF5"
  },
  mealTypeButtonActive: {
    backgroundColor: "#1FA97D"
  },
  mealTypeButtonText: {
    color: "#35524A",
    fontSize: 13,
    fontWeight: "500"
  },
  mealTypeButtonTextActive: {
    color: "#FFFFFF"
  }
});