import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { registerDevice, unregisterDevice } from "../api/notifications";
import { useUserStore } from "../store/user-store";

/**
 * Hook для регистрации push-токена при входе пользователя
 * Запрашивает разрешения и отправляет токен на сервер
 */
export function usePushNotifications() {
  const profile = useUserStore((state) => state.profile);
  const hasRegistered = useRef(false);
  const lastUserId = useRef<string | null>(null);

  // Сброс флага при смене пользователя
  useEffect(() => {
    const currentId = profile?.id ?? null;
    if (currentId !== lastUserId.current) {
      hasRegistered.current = false;
      lastUserId.current = currentId;
    }
  }, [profile?.id]);

  // Дерегистрация токена при логауте (когда профиль стал null)
  useEffect(() => {
    if (profile === null) {
      // Fire-and-forget: если к этому моменту токен ещё валиден, запрос выполнится
      void unregisterDevice().catch(() => undefined);
    }
  }, [profile]);

  useEffect(() => {
    if (!profile || hasRegistered.current) {
      return;
    }

    const register = async () => {
      try {
        // Запрашиваем разрешения
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          console.log("Push notification permissions not granted");
          return;
        }

        const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
        if (!projectId) {
          console.warn("Expo projectId is missing; set EXPO_PUBLIC_EAS_PROJECT_ID in env");
          return;
        }

        // Получаем Expo Push Token
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId
        });

        const pushToken = tokenData.data;

        // Регистрируем на сервере
        await registerDevice({
          pushToken,
          deviceInfo: {
            platform: Platform.OS
          }
        });

        hasRegistered.current = true;
        console.log("Push token registered:", pushToken);
      } catch (error) {
        console.error("Failed to register push token:", error);
      }
    };

    register().catch(() => undefined);
  }, [profile]);
}
