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
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from "@vivaform/shared";

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