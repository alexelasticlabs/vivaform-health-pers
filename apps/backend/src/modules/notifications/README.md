# Push-уведомления через Expo

## Описание

Система отправки push-уведомлений пользователям мобильного приложения через Expo Push Notifications.

## Возможности

### Типы уведомлений

1. **💧 Напоминания о воде** - каждые 2 часа (9:00-21:00)
2. **🍳 Напоминания о приёмах пищи** - завтрак (8:00), обед (13:00), ужин (19:00)
3. **⚖️ Напоминания о взвешивании** - каждый понедельник в 8:00
4. **✨ Уведомления о рекомендациях** - при генерации новых персональных рекомендаций

### Настройки пользователя

Уведомления отправляются только пользователям с:
- ✅ Зарегистрированным Push Token
- ✅ Включённым параметром `wantReminders` в профиле

## Архитектура

### NotificationsService

Основной сервис для отправки уведомлений:

```typescript
// Регистрация устройства
await notificationsService.registerPushToken(userId, expoPushToken);

// Отправка напоминания о воде
await notificationsService.sendWaterReminder(userId);

// Отправка напоминания о взвешивании
await notificationsService.sendWeightTrackingReminder(userId);

// Отправка напоминания о приёме пищи
await notificationsService.sendMealReminder(userId, "breakfast");

// Отправка уведомления о рекомендациях
await notificationsService.sendRecommendationsNotification(userId, 3);
```

### NotificationsCronService

Автоматические задачи по расписанию:

| Задача | Расписание | Описание |
|--------|-----------|----------|
| Вода | `0 9,11,13,15,17,19,21 * * *` | Каждые 2 часа с 9:00 до 21:00 |
| Завтрак | `0 8 * * *` | Каждый день в 8:00 |
| Обед | `0 13 * * *` | Каждый день в 13:00 |
| Ужин | `0 19 * * *` | Каждый день в 19:00 |
| Взвешивание | `0 8 * * 1-5` | Понедельник-пятница в 8:00 |

## API Endpoints

### POST /notifications/register-device

Регистрация Push Token устройства.

**Request:**
```json
{
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**Response:**
```json
{
  "message": "Push token registered successfully"
}
```

### POST /notifications/test-water-reminder

Тестовая отправка напоминания о воде (только для разработки).

**Response:**
```json
{
  "message": "Water reminder sent"
}
```

### POST /notifications/test-weight-reminder

Тестовая отправка напоминания о взвешивании (только для разработки).

**Response:**
```json
{
  "message": "Weight reminder sent"
}
```

## Интеграция в мобильное приложение

### 1. Установка зависимостей

```bash
npx expo install expo-notifications expo-device
```

### 2. Регистрация Push Token

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

async function registerForPushNotificationsAsync() {
  let token;
  
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
    
    // Отправка токена на backend
    await fetch('http://localhost:3000/notifications/register-device', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ pushToken: token })
    });
  }
  
  return token;
}
```

### 3. Настройка обработчиков уведомлений

```typescript
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

// Поведение при получении уведомления (когда приложение на переднем плане)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function App() {
  useEffect(() => {
    // Обработчик при получении уведомления
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Обработчик при нажатии на уведомление
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      // Навигация в зависимости от типа уведомления
      if (data.type === 'water_reminder') {
        navigation.navigate('WaterTracking');
      } else if (data.type === 'new_recommendations') {
        navigation.navigate('Recommendations');
      }
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return <YourApp />;
}
```

## База данных

Поле `pushToken` добавлено в модель `User`:

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  name          String?
  pushToken     String?  // Expo Push Token
  // ... остальные поля
}
```

## Мониторинг и логирование

Все операции логируются через `Logger`:

```
[NotificationsService] Registered push token for user abc123
[NotificationsCronService] Sending water reminders...
[NotificationsCronService] Water reminders sent to 45/50 users
[NotificationsService] Push notification error for ticket 3: DeviceNotRegistered
```

### Типы ошибок

- `DeviceNotRegistered` - токен больше не валиден, нужно удалить
- `MessageTooBig` - превышен лимит размера (4KB)
- `MessageRateExceeded` - превышен лимит отправки (не более 100 в секунду)

## Лимиты и ограничения

- **Размер сообщения:** до 4KB
- **Батчинг:** до 100 уведомлений за раз
- **Rate limit:** рекомендуется не более 100 уведомлений в секунду
- **TTL:** уведомления хранятся до 30 дней

## Best Practices

1. **Валидация токенов** - всегда проверяйте токен через `Expo.isExpoPushToken()`
2. **Батчинг** - отправляйте по 100 уведомлений за раз через `expo.chunkPushNotifications()`
3. **Обработка ошибок** - логируйте `DeviceNotRegistered` и удаляйте невалидные токены
4. **Персонализация** - используйте `data` для передачи контекста
5. **Таймзоны** - учитывайте часовой пояс пользователя (сейчас Europe/Moscow)

## Тестирование

### Локальное тестирование

```bash
# 1. Зарегистрируйте Push Token в мобильном приложении
# 2. Отправьте тестовое уведомление
curl -X POST http://localhost:3000/notifications/test-water-reminder \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Проверка cron-задач

Задачи автоматически запускаются при старте приложения. Для проверки:

1. Запустите backend: `pnpm --filter @vivaform/backend run dev`
2. Дождитесь соответствующего времени (например, 9:00 для водных напоминаний)
3. Проверьте логи:
   ```
   [NotificationsCronService] Sending water reminders...
   [NotificationsCronService] Water reminders sent to 10/10 users
   ```

## Roadmap

- [ ] Персонализированное время отправки на основе `wakeUpTime` и `dinnerTime`
- [ ] Умные напоминания (не отправлять, если пользователь уже выполнил действие)
- [ ] A/B тестирование текстов уведомлений
- [ ] Аналитика эффективности (open rate, conversion rate)
- [ ] Поддержка локализации (EN, RU, ES)
- [ ] Rich notifications с изображениями
- [ ] Группировка уведомлений по категориям
