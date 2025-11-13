# Админ-панель VivaForm - Руководство

## Обзор

Полностью переработанная профессиональная админ-панель enterprise-уровня с модульной архитектурой, современным UI и полным набором функций для управления платформой.

## Архитектура

### Структура файлов

```
apps/web/src/
├── components/admin/
│   ├── admin-layout.tsx          # Главный layout со sidebar и breadcrumbs
│   ├── stats-card.tsx            # Карточка статистики с трендами
│   ├── filter-bar.tsx            # Универсальная панель фильтров
│   ├── bulk-actions-bar.tsx      # Панель массовых действий
│   └── pagination.tsx            # Компонент пагинации
├── pages/admin/
│   ├── overview-page.tsx         # Дашборд с KPI и графиками
│   ├── users-page.tsx            # Управление пользователями
│   ├── foods-page.tsx            # Модерация продуктов питания
│   ├── subscriptions-page.tsx    # Управление подписками
│   ├── support-page.tsx          # Система тикетов поддержки
│   ├── settings-page.tsx         # Настройки приложения
│   └── articles-page.tsx         # Управление статьями
├── api/
│   ├── admin.ts                  # Основные API методы
│   └── admin-articles.ts         # API для работы со статьями
└── components/ui/
    ├── card.tsx                  # UI компоненты
    ├── button.tsx
    ├── input.tsx
    ├── select.tsx
    ├── dialog.tsx
    ├── checkbox.tsx
    ├── badge.tsx
    ├── alert.tsx
    └── dropdown-menu.tsx
```

### Роутинг

```typescript
/app/admin                    → Overview (дашборд)
/app/admin/users             → Управление пользователями
/app/admin/foods             → Модерация продуктов
/app/admin/subscriptions     → Подписки
/app/admin/articles          → Статьи
/app/admin/support           → Поддержка
/app/admin/settings          → Настройки
```

Все роуты защищены `AdminGuard` - доступ только для пользователей с ролью `ADMIN`.

## Основные возможности

### 1. Overview Dashboard

**Функции:**
- Real-time KPI метрики (пользователи, подписки, MRR, DAU)
- Графики трендов (revenue, новые пользователи, распределение подписок)
- System Health мониторинг (БД, Redis, API, Stripe)
- Автообновление метрик каждые 30 секунд

**Компоненты:**
- `StatsCard` - карточки с метриками и процентными изменениями
- Recharts для визуализации (Line, Bar, Pie charts)
- Alert индикаторы проблем с системой

### 2. Users Management

**Функции:**
- Фильтрация по email, роли, тарифу, дате регистрации
- Debounced поиск (500ms задержка)
- Bulk операции (массовое изменение роли/тарифа)
- Экспорт в CSV с учетом фильтров
- User detail view с историей активности
- Pagination (20 записей на страницу)

**Компоненты:**
- `FilterBar` - универсальная панель фильтрации
- `BulkActionsBar` - массовые действия
- `Pagination` - навигация по страницам

### 3. Food Items Moderation

**Функции:**
- Модерация пользовательских продуктов
- Фильтры: All / Verified / Pending
- Bulk approve/reject
- Просмотр детальной информации (калории, белки, жиры, углеводы)
- Удаление некорректных записей
- Информация о создателе

**UI:**
- Чекбоксы для множественного выбора
- Визуальные индикаторы статуса (CheckCircle/XCircle)
- Hover эффекты для лучшего UX

### 4. Subscriptions

**Функции:**
- Просмотр всех подписок с фильтрацией
- Статистика: активные подписки, MRR, churn rate
- Фильтры по статусу (Active, Canceled, Past Due) и плану
- Информация о периоде и автопродлении
- Экспорт данных

**Метрики:**
- Normalized MRR (все планы приведены к месячной стоимости)
- Churn rate за последние 30 дней
- Распределение по планам

### 5. Support Tickets

**Функции:**
- Управление тикетами поддержки
- Фильтрация по статусу и приоритету
- Просмотр деталей тикета с историей ответов
- Ответ на тикеты через rich text
- Изменение статуса (Open → In Progress → Resolved → Closed)
- Изменение приоритета (Low → Medium → High → Urgent)
- Назначение тикетов админам

**Статистика:**
- Открытые тикеты
- В работе
- Среднее время ответа
- Satisfaction rate

### 6. Settings

**Функции:**
- Настройки приложения (название, support email)
- Email уведомления (включение, weekly digest)
- Push уведомления
- Analytics интеграции (Meta Pixel, Google Ads, GA)
- Feature flags (meal planner, AI recommendations, social sharing)
- Unsaved changes detection
- Reset функционал

**UX:**
- Визуальная индикация несохраненных изменений
- Grouped sections для логической организации
- Validation перед сохранением

### 7. Articles Management

**Функции:**
- CRUD операции для статей
- Draft/Published статусы
- Featured маркировка
- Markdown поддержка для контента
- Категории и теги
- Image URL для обложки
- Счетчик просмотров
- Publish/Unpublish быстрые действия

**Editor:**
- Textarea с Markdown поддержкой
- Live preview (будущая фича)
- Auto-slug generation
- SEO метаданные

## UI/UX Особенности

### Design System

**Цветовая схема:**
- Primary: Emerald (зеленый) для действий и активных элементов
- Destructive: Red для удаления и критичных действий
- Neutral: Gray для фоновых элементов
- Dark mode поддержка

**Компоненты:**
- Все компоненты следуют shadcn/ui паттернам
- Radix UI primitives для сложных компонентов
- Tailwind CSS для стилизации
- `cn()` утилита с tailwind-merge для правильного мерджа классов

### Responsive Design

- Mobile-first подход
- Collapsible sidebar для экономии места
- Адаптивные таблицы с горизонтальным скроллом
- Touch-friendly интерфейс

### Performance

- React Query для кеширования и оптимизации запросов
- Debounced search для снижения нагрузки
- Lazy loading компонентов через React.lazy
- Optimistic updates для мгновенного отклика

### Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus indicators
- Screen reader support

## API Integration

### Admin API Methods

```typescript
// Users
getAllUsersFiltered(params)
updateUserRole(userId, role)
bulkUpdateUsers(userIds, updates)
exportUsersCsv(filters)
getUserDetails(id)

// Foods
getAdminFoodItems(verified, page, limit)
verifyFoodItem(foodId, verified)
deleteFoodItem(foodId)

// Subscriptions
listSubscriptions(params)

// Support
listTickets(params)
getTicket(id)
updateTicket(id, patch)
replyTicket(id, body)

// Settings
getSettings()
patchSettings(patch)

// Overview
getOverviewKpis()
getRevenueTrend()
getNewUsers(compare)
getSubsDistribution()
getSystemHealth()

// Articles
listArticles(params)
createArticle(data)
updateArticle(id, data)
deleteArticle(id)
publishArticle(id)
unpublishArticle(id)
```

### Error Handling

```typescript
import { extractErrorMessage } from '@/api/errors';

try {
  await someApiCall();
  toast.success('Success message');
} catch (error) {
  toast.error(extractErrorMessage(error));
}
```

## Backend Requirements

Убедитесь, что backend поддерживает следующие endpoints:

```
GET    /admin/users
GET    /admin/users/:id
PATCH  /admin/users/:id/role
PATCH  /admin/users/bulk
GET    /admin/users/export.csv

GET    /admin/food-items
PATCH  /admin/food-items/:id/verify
DELETE /admin/food-items/:id

GET    /admin/subs
GET    /admin/tickets
GET    /admin/tickets/:id
PATCH  /admin/tickets/:id
PATCH  /admin/tickets/:id/reply

GET    /admin/settings
PATCH  /admin/settings

GET    /admin/overview/kpis
GET    /admin/overview/revenue-trend
GET    /admin/overview/new-users
GET    /admin/overview/subscriptions-distribution
GET    /admin/overview/system-health

GET    /articles (public)
POST   /admin/articles
PATCH  /admin/articles/:id
DELETE /admin/articles/:id
```

## Deployment

### Environment Variables

Для production build требуется:
```bash
VITE_API_URL=https://api.yourdomain.com
```

### Build

```bash
cd apps/web
pnpm run build
```

### Preview

```bash
pnpm run preview
```

## Development

### Run Dev Server

```bash
cd apps/web
pnpm run dev
```

### Access Admin Panel

1. Login с admin аккаунтом (role: ADMIN)
2. Navigate to `/app/admin`
3. Sidebar навигация для переключения между секциями

### Add New Admin Page

1. Создать компонент в `apps/web/src/pages/admin/`
2. Добавить роут в `router.tsx`
3. Добавить пункт в навигацию в `admin-layout.tsx`
4. Создать API методы если нужно

## Security

- JWT authentication через `AdminGuard`
- Role-based access control (только ADMIN)
- CSRF protection на mutations
- Rate limiting на backend
- Input validation
- XSS protection

## Future Enhancements

### Planned Features

1. **Real-time Updates**
   - WebSocket для live уведомлений
   - Real-time dashboard updates
   - Online users indicator

2. **Advanced Analytics**
   - Cohort analysis
   - Retention curves
   - Funnel visualization
   - Custom date ranges
   - Comparison periods

3. **User Management**
   - User impersonation (admin acting as user)
   - Activity logs
   - Suspend/Ban users
   - Mass email campaigns

4. **Content Management**
   - Rich text editor для статей
   - Image upload
   - Draft auto-save
   - Content scheduling

5. **Support Enhancements**
   - Auto-assignment rules
   - SLA tracking
   - Canned responses
   - Internal notes
   - Customer satisfaction surveys

6. **Export & Reports**
   - Scheduled exports
   - PDF reports
   - Excel advanced formats
   - Email delivery

7. **Mobile App**
   - Dedicated mobile admin app
   - Push notifications для админов
   - Offline mode

## Troubleshooting

### Common Issues

**TypeScript errors:**
- Run `pnpm exec tsc --noEmit` to check for errors
- Ensure all imports are correct
- Check that UI components are properly exported

**Build fails:**
- Check environment variables
- Clear node_modules and reinstall: `pnpm install`
- Check for circular dependencies

**API errors:**
- Verify backend is running
- Check CORS configuration
- Verify JWT token is valid
- Check network requests in DevTools

**UI not rendering:**
- Check React Query DevTools
- Verify data structure matches types
- Check browser console for errors

## Support

Для вопросов и поддержки:
- Проверьте документацию в `/docs`
- Используйте внутренний support ticket system
- Контакт: tech@vivaform.com

---

**Версия:** 2.0.0  
**Последнее обновление:** 2025-11-13  
**Статус:** Production Ready ✅

