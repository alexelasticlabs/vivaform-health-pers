import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, router } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { fetchDailyDashboard } from "../src/api/dashboard";
import { useUserStore } from "../src/store/user-store";

export default function HomeScreen() {
  const { isAuthenticated, profile } = useUserStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    profile: state.profile
  }));

  const [selectedDate] = useState(() => new Date().toISOString().slice(0, 10));

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

  if (!isAuthenticated) {
    return null;
  }

  const nutrition = data?.nutrition.summary;
  const water = data?.water.totalMl ?? 0;
  const weight = data?.weight.latest?.weightKg ?? "—";
  const isPremium = profile?.tier === "PREMIUM";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.subtitle}>Ваш персональный помощник</Text>
        <Text style={styles.title}>VivaForm</Text>
        <Text style={styles.description}>
          Следите за питанием, водой и весом. VivaForm анализирует ваш день и подсказывает, что улучшить.
        </Text>
        <Link href="/planner" style={styles.primaryButton}>
          Открыть дневник
        </Link>
        {!isPremium ? (
          <TouchableOpacity style={styles.premiumBanner} onPress={() => router.push("/premium") }>
            <Text style={styles.premiumText}>Откройте VivaForm+ и получите персональный план →</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#1FA97D" />
          <Text style={styles.loadingText}>Загружаем данные...</Text>
        </View>
      ) : (
        <View style={styles.metricsGrid}>
          <MetricCard label="Калории" value={nutrition ? `${nutrition.calories}` : "—"} suffix="ккал" />
          <MetricCard label="Белки" value={nutrition ? `${nutrition.protein}` : "—"} suffix="г" />
          <MetricCard label="Вода" value={`${water}`} suffix="мл" />
          <MetricCard label="Вес" value={`${weight}`} suffix="кг" />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Рекомендации VivaForm</Text>
        {isLoading ? (
          <Text style={styles.sectionDescription}>Собираем советы...</Text>
        ) : data && data.recommendations.length > 0 ? (
          data.recommendations.map((item) => (
            <View key={item.id} style={styles.recommendation}>
              <Text style={styles.recommendationTitle}>{item.title}</Text>
              <Text style={styles.recommendationBody}>{item.body}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.sectionDescription}>
            Пока нет рекомендаций — заполните дневник, и мы подготовим персональные советы.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const MetricCard = ({ label, value, suffix }: { label: string; value: string; suffix: string }) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>
      {value}
      <Text style={styles.metricSuffix}> {suffix}</Text>
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 24
  },
  hero: {
    backgroundColor: "#E1F7E2",
    borderRadius: 24,
    padding: 24,
    gap: 12
  },
  subtitle: {
    fontSize: 14,
    color: "#0A6C3B",
    fontWeight: "600"
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: 8,
    color: "#0A2E23"
  },
  description: {
    fontSize: 16,
    color: "#35524A",
    marginTop: 12,
    lineHeight: 22
  },
  primaryButton: {
    marginTop: 20,
    alignSelf: "flex-start",
    backgroundColor: "#1FA97D",
    color: "white",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    fontWeight: "600"
  },
  premiumBanner: {
    marginTop: 16,
    backgroundColor: "#0A2E23",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  premiumText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600"
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  metricCard: {
    flexBasis: "47%",
    backgroundColor: "#F4FBF5",
    borderRadius: 20,
    padding: 16
  },
  metricLabel: {
    fontSize: 12,
    color: "#4A6B60",
    marginBottom: 8
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0A2E23"
  },
  metricSuffix: {
    fontSize: 12,
    color: "#35524A"
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0A2E23"
  },
  sectionDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: "#35524A"
  },
  recommendation: {
    backgroundColor: "#F4FBF5",
    borderRadius: 16,
    padding: 16,
    gap: 8
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0A2E23"
  },
  recommendationBody: {
    fontSize: 14,
    color: "#35524A",
    lineHeight: 20
  },
  loading: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 8
  },
  loadingText: {
    color: "#35524A"
  }
});