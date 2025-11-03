# Push Notifications Setup

## Конфигурация для Expo

Чтобы push-уведомления работали в production, нужно:

1. **Обновить app.json/app.config.ts**
   
   Добавьте `projectId` в конфигурацию Expo:

   ```json
   {
     "expo": {
       "extra": {
         "eas": {
           "projectId": "your-project-id-from-expo-dev"
         }
       }
     }
   }
   ```

2. **Обновить хук usePushNotifications**

   В файле `apps/mobile/src/hooks/use-push-notifications.ts` замените:
   
   ```typescript
   projectId: "your-project-id" // TODO
   ```
   
   на реальный projectId из вашего Expo проекта.

3. **Настроить APNs (iOS) и FCM (Android)**

   Следуйте официальной документации Expo:
   - https://docs.expo.dev/push-notifications/push-notifications-setup/

## Как это работает

1. При входе пользователя вызывается хук `usePushNotifications()`
2. Хук запрашивает разрешения на уведомления
3. Получает Expo Push Token
4. Отправляет токен на backend через `POST /notifications/register-device`
5. Backend сохраняет токен в поле `user.pushToken`

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
