import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { registerDevice } from "../api/notifications";
import { useUserStore } from "../store/user-store";

/**
 * Hook для регистрации push-токена при входе пользователя
 * Запрашивает разрешения и отправляет токен на сервер
 */
export function usePushNotifications() {
  const profile = useUserStore((state) => state.profile);
  const hasRegistered = useRef(false);

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

        // Получаем Expo Push Token
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: "your-project-id" // TODO: заменить на реальный projectId из app.json
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

    register();
  }, [profile]);
}
