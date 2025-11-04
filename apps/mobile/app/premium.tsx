import { useCallback, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from "@vivaform/shared";

import { createCheckoutSession, getSubscription } from "../src/api/subscriptions";
import { useUserStore } from "../src/store/user-store";

export default function PremiumScreen() {
  const setTier = useUserStore((state) => state.setTier);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["subscription"],
    queryFn: getSubscription
  });

  const tier = data?.tier ?? "FREE";

  const checkoutMutation = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: async ({ url }) => {
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET
      });
      const result = await refetch();
      if (result.data?.tier === "PREMIUM") {
        setTier("PREMIUM");
      }
    }
  });

  const handleSelect = useCallback(
    (plan: SubscriptionPlan) => {
      checkoutMutation.mutate(plan);
    },
    [checkoutMutation]
  );

  const premiumActive = useMemo(() => tier === "PREMIUM", [tier]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.badge}>VivaForm+</Text>
        <Text style={styles.title}>Персональный план силы и энергии</Text>
        <Text style={styles.subtitle}>
          Генератор меню, глубокая аналитика, экспорт отчетов и интеграции с Apple Health / Google Fit.
        </Text>
        {premiumActive ? (
          <View style={styles.activeTag}>
            <Text style={styles.activeTagText}>Подписка активна</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Что входит в VivaForm+</Text>
        <View style={styles.features}>
          <Text style={styles.feature}>• Генератор меню с учётом целей и предпочтений</Text>
          <Text style={styles.feature}>• Аналитика БЖУ и веса за недели и месяцы</Text>
          <Text style={styles.feature}>• Экспорт отчётов в PDF/CSV</Text>
          <Text style={styles.feature}>• Синхронизация с Apple Health / Google Fit</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Выберите тариф</Text>
        {isLoading ? (
          <ActivityIndicator color="#1FA97D" />
        ) : (
          SUBSCRIPTION_PLANS.map((option) => (
            <TouchableOpacity
              key={option.plan}
              style={[styles.planCard, premiumActive && styles.planDisabled]}
              onPress={() => handleSelect(option.plan)}
              disabled={premiumActive || checkoutMutation.isPending}
            >
              <View>
                <Text style={styles.planTitle}>{option.title}</Text>
                <Text style={styles.planDescription}>{option.description}</Text>
              </View>
              <Text style={styles.planPrice}>{option.price}</Text>
            </TouchableOpacity>
          ))
        )}
        {premiumActive ? (
          <TouchableOpacity style={styles.manageButton} onPress={() => router.back()}>
            <Text style={styles.manageButtonText}>Вернуться в приложение</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  hero: {
    gap: 8,
    paddingVertical: 16
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#E6F7F1",
    color: "#1FA97D",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: "600"
  },
  title: {
    fontSize: 22,
    fontWeight: "700"
  },
  subtitle: {
    color: "#555"
  },
  activeTag: {
    alignSelf: "flex-start",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999
  },
  activeTagText: {
    color: "#065F46",
    fontWeight: "600"
  },
  section: {
    marginTop: 16,
    gap: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700"
  },
  features: {
    gap: 6
  },
  feature: {
    color: "#333"
  },
  planCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  planDisabled: {
    opacity: 0.6
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4
  },
  planDescription: {
    color: "#555"
  },
  planPrice: {
    fontWeight: "700"
  },
  manageButton: {
    alignSelf: "center",
    marginTop: 8,
    backgroundColor: "#1FA97D",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12
  },
  manageButtonText: {
    color: "#fff",
    fontWeight: "600"
  }
});