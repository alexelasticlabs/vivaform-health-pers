# Система автоматических рекомендаций

## Описание

Система генерирует персональные рекомендации для пользователей на основе анализа их данных:
- Записи питания (Nutrition)
- Потребление воды (Water)  
- Прогресс веса (Weight)

Рекомендации создаются по расписанию (каждый день в 6:00) или по запросу пользователя.

## Архитектура

### Компоненты

1. **RecommendationsGeneratorService** - основной сервис генерации
   - `generateForAllUsers()` - генерация для всех пользователей с профилями
   - `generateForUser(userId)` - генерация для конкретного пользователя
   - `collectUserData()` - анализ данных за последние 7 дней
   - `applyRules()` - применение 8 правил рекомендаций

2. **RecommendationsCronService** - планировщик задач
   - Автоматический запуск каждый день в 6:00 (Europe/Moscow)
   - Логирование результатов выполнения

3. **RecommendationsController** - HTTP API
   - `POST /recommendations/generate` - ручная генерация

## Правила рекомендаций

### Priority 1 (Критические)

**1. Дефицит белка**
- Условие: средний белок < 70% от цели
- Сообщение: "Increase your protein intake"
- Описание: Советы по источникам белка (яйца, курица, рыба, бобовые)

**2. Низкая калорийность**
- Условие: средние калории < 80% от цели
- Сообщение: "Your calorie intake is too low"
- Описание: Рекомендации по увеличению калорий

### Priority 2 (Важные)

**3. Превышение калорий**
- Условие: средние калории > 120% от цели
- Сообщение: "You're consuming too many calories"
- Описание: Советы по снижению калорийности

**4. Недостаточное потребление воды**
- Условие: средняя вода < 60% от цели
- Сообщение: "Drink more water"
- Описание: Рекомендации по режиму питья

### Priority 3 (Средние)

**5. Плато веса**
- Условие: изменение веса < 0.2кг за 14 дней
- Сообщение: "Your weight has plateaued"
- Описание: Советы по преодолению плато

**6. Нет взвешивания**
- Условие: последнее взвешивание > 7 дней назад
- Сообщение: "Track your weight regularly"
- Описание: Напоминание о важности регулярного взвешивания

### Priority 4-5 (Положительные)

**7. Отличный контроль калорий**
- Условие: калории в пределах 90-110% от цели
- Сообщение: "Great job tracking your calories!"

**8. Отличная гидратация**
- Условие: вода в пределах 90-110% от цели
- Сообщение: "Excellent hydration!"

## API

### POST /recommendations/generate

Генерация рекомендаций для текущего пользователя.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Generated 3 recommendations",
  "count": 3
}
```

### GET /recommendations/latest?limit=3

Получение последних рекомендаций.

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "message": "Increase your protein intake",
    "description": "Try adding more eggs, chicken, fish...",
    "priority": 1,
    "createdAt": "2025-01-01T06:00:00Z"
  }
]
```

## Cron Jobs

### Daily Recommendations Generation

- **Schedule:** Каждый день в 6:00 (Europe/Moscow)
- **Timezone:** Europe/Moscow
- **Job Name:** generate-daily-recommendations
- **Service:** RecommendationsCronService.handleDailyRecommendations()

Логи выполнения:
```
[RecommendationsCronService] Starting daily recommendations generation...
[RecommendationsCronService] Daily recommendations generation completed. Processed 150 users in 2341ms
```

## Настройка

### Установка зависимостей

```bash
pnpm add @nestjs/schedule
```

### Подключение модулей

**app.module.ts:**
```typescript
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // ... другие модули
  ]
})
```

**recommendations.module.ts:**
```typescript
import { RecommendationsCronService } from './recommendations-cron.service';

@Module({
  providers: [
    RecommendationsService,
    RecommendationsGeneratorService,
    RecommendationsCronService
  ]
})
```

## Тестирование

### Ручная генерация через API

```bash
curl -X POST http://localhost:3000/recommendations/generate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Проверка cron-задачи

Сервис автоматически запускается при старте приложения. Для проверки:

1. Запустите приложение
2. Дождитесь 6:00 (или измените время в `@Cron`)
3. Проверьте логи:
   ```
   [RecommendationsCronService] Starting daily recommendations generation...
   ```

### Тестовые данные

Для тестирования создайте пользователя с:
- Профилем (через quiz)
- Записями питания за последние 3-4 дня (с низким белком)
- Записями воды (ниже целевого значения)

Вызовите `POST /recommendations/generate` и проверьте:
- Создались ли 3 рекомендации
- Правильная ли сортировка по priority
- Корректность сообщений

## Мониторинг

### Метрики для отслеживания

1. **Количество обработанных пользователей** - сколько пользователей получили рекомендации
2. **Время выполнения** - длительность генерации для всех пользователей
3. **Ошибки генерации** - failed attempts логируются с error.stack

### Логи

Все операции логируются через `Logger`:

- `log()` - успешные операции
- `error()` - ошибки с stack trace
- `warn()` - предупреждения (например, у пользователя нет профиля)

## Оптимизация

### Производительность

Текущая реализация обрабатывает пользователей последовательно. Для больших баз (>1000 пользователей) рекомендуется:

1. **Batch Processing** - обработка пачками по 100 пользователей
2. **Queue System** - использование BullMQ для фоновой обработки
3. **Caching** - кэширование целевых значений пользователей

### Масштабирование

При росте нагрузки:

1. Переместить генерацию в отдельный сервис (microservice)
2. Использовать Redis для хранения промежуточных данных
3. Добавить rate limiting для ручной генерации

## Дальнейшие улучшения

1. **Персонализация** - учёт предпочтений пользователя (dietType, allergies)
2. **ML-модели** - предсказание проблем до их возникновения
3. **A/B тестирование** - эксперименты с текстами рекомендаций
4. **Push-уведомления** - отправка рекомендаций через push
5. **Локализация** - перевод рекомендаций на разные языки
