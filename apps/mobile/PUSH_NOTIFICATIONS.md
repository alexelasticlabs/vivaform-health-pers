# Push Notifications Setup

## Конфигурация для Expo

Чтобы push-уведомления работали в production, нужно:

1. Настроить `app.config.ts`
   
   В разделе `extra.eas.projectId` должен быть указан UUID вашего проекта Expo. Рекомендуемый способ — через переменную окружения:

   ```bash
   # .env / CI vars
   EXPO_PUBLIC_EAS_PROJECT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

   Файл `apps/mobile/app.config.ts` уже читает эту переменную:

   ```ts
   extra: {
     eas: {
       projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || ""
     }
   }
   ```

2. Хук регистрации `usePushNotifications`

   Хук не содержит хардкода и берёт `projectId` из `expo-constants`:

   ```ts
   const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
   ```

   Убедитесь, что переменная окружения задана на CI/локально. Ручная подстановка `"your-project-id"` не требуется.

3. Настроить APNs (iOS) и FCM (Android)

   Следуйте официальной документации Expo:
   - https://docs.expo.dev/push-notifications/push-notifications-setup/

## Как это работает

1. При входе пользователя вызывается хук `usePushNotifications()`
2. Хук запрашивает разрешения на уведомления
3. Получает Expo Push Token
4. Отправляет токен на backend через `POST /notifications/register-device`
5. Backend сохраняет токен в поле `user.pushToken`
6. При выходе из аккаунта выполняется `DELETE /notifications/register-device` и токен отвязывается

## Тестирование локально

1. Используйте реальное устройство (не симулятор)
2. Установите Expo Go или development build
3. Войдите в приложение
4. Разрешите уведомления
5. Проверьте логи: "Push token registered: ExponentPushToken[...]"
6. Проверьте в БД, что токен сохранился в таблице `user`

## Отправка тестового уведомления

Используйте Expo Push Tool: https://expo.dev/notifications

Или отправьте через API:

```bash
curl -H "Content-Type: application/json" \
     -X POST https://exp.host/--/api/v2/push/send \
     -d '{
       "to": "ExponentPushToken[your-token]",
       "title": "Test",
       "body": "Hello from VivaForm!"
     }'
```
