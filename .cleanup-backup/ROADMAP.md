# 🗺️ VivaForm Development Roadmap

## 📋 Текущий статус проекта (ноябрь 2025)

### ✅ Уже реализовано

**Frontend (Web)**
- ✅ Landing page с улучшенными текстами и анимациями
- ✅ Базовая аутентификация (login/register)
- ✅ **Quiz с 10 шагами (30+ вопросов)** — полный onboarding flow
- ✅ **Forgot Password + Reset Password + Email Verification** — полный security flow
- ✅ **Premium Page с pricing, testimonials, FAQ** — conversion-focused
- ✅ **Meal Planner MVP (PREMIUM feature)** — генератор меню на неделю БЕЗ AI
- ✅ Dashboard с виджетами (nutrition, water, weight, recommendations)
- ✅ Progress page (графики веса)
- ✅ Recommendations page (базовая структура)
- ✅ Settings page
- ✅ Theme toggle (dark/light mode)
- ✅ Support widget
- ✅ Comprehensive тесты (landing + widget)
- ✅ Analytics integration (Meta Pixel + Google Ads готовы)
- ✅ **Admin Panel** — управление пользователями, модерация продуктов, статистика

**Backend**
- ✅ NestJS API structure
- ✅ Prisma + PostgreSQL (MealTemplate + FoodItem модели)
- ✅ JWT + Refresh tokens
- ✅ **EmailService с Nodemailer** — welcome, verification, password reset templates
- ✅ **Stripe Webhooks** — auto-sync subscriptions (4 event handlers)
- ✅ **QuizService** — расчёт BMI, BMR, TDEE, macros
- ✅ **MealPlanService** — алгоритмическая генерация меню (без AI API)
- ✅ **RecommendationsGeneratorService** — 8 алгоритмических правил + автоматическая генерация
- ✅ **NotificationsService** — Push-уведомления через Expo SDK + 5 cron-задач
- ✅ **FoodService** — поиск по базе продуктов (60 seed items)
- ✅ **AdminService** — управление пользователями, модерация, статистика
- ✅ Stripe integration (webhooks, subscriptions)
- ✅ Базовые модули (auth, users, dashboard, weight, water, nutrition, recommendations, quiz, webhooks, meal-plan)
- ✅ Security (Helmet, CORS, rate limiting, Stripe signature verification)

**Infrastructure**
- ✅ Monorepo (Turborepo + pnpm)
- ✅ TypeScript everywhere
- ✅ Vite 6 + React 19
- ✅ Tailwind CSS 4 + Radix UI + lucide-react icons

---

## 🎯 Phase 1: Core User Journey (Приоритет 1) — ✅ ЗАВЕРШЕНО

### 🎪 1.1 Onboarding Quiz — ✅ РЕАЛИЗОВАНО
**Статус:** ✅ Полностью готово  
**Описание:** Интерактивный квиз из 10 шагов (30+ вопросов) для персонализации

**Реализовано:**
- ✅ `apps/web/src/pages/quiz-page.tsx` — главная страница квиза
- ✅ State management (Zustand quiz-store)
- ✅ 10 шагов квиза:
  1. ✅ IntroStep — выбор диеты (Mediterranean/Carnivore/Anti-Inflammatory)
  2. ✅ BodyMetricsStep — рост, вес, BMI калькулятор
  3. ✅ GoalTimelineStep — целевой вес и таймлайн
  4. ✅ ActivityLevelStep — уровень активности (5 вариантов)
  5. ✅ FoodHabitsStep — 5 вопросов о питании (meals/day, breakfast, snacks, fast food, cooking)
  6. ✅ EnergyScheduleStep — 5 вопросов о режиме (sleep, activity, exercise, wake/dinner time)
  7. ✅ PreferencesStep — 6 вопросов (allergies, avoided foods, complexity, cooking time)
  8. ✅ EmotionalStep — 5 вопросов (stress eating, motivation, stress level, comfort source, confidence)
  9. ✅ HydrationStep — 4 вопроса (daily water, reminders, tracking, health app)
  10. ✅ IntegrationsStep — тема интерфейса
- ✅ Progress bar с анимациями
- ✅ Валидация на каждом шаге
- ✅ Сохранение в localStorage
- ✅ Backend: `POST /api/quiz/submit` — расчёт BMI, BMR, TDEE, macros
- ✅ Финальный экран с результатами и CTA "Continue → Create account"

---

### 🔐 1.2 Улучшение Auth Flow — ✅ РЕАЛИЗОВАНО
**Статус:** ✅ Полностью готово

**Реализовано:**
- ✅ Forgot Password flow
  - ✅ `apps/web/src/pages/forgot-password-page.tsx`
  - ✅ Backend: `POST /auth/forgot-password` — генерирует JWT токен (1 час)
  - ✅ Email с ссылкой восстановления (HTML template)
  - ✅ `apps/web/src/pages/reset-password-page.tsx` — парсинг token из URL
- ✅ Email verification
  - ✅ Отправка письма после регистрации (welcome + verification)
  - ✅ `GET /auth/verify-email?token=...` — маркирует emailVerified=true
  - ✅ `apps/web/src/pages/email-verification-page.tsx` — автоматическая верификация
- ✅ EmailService с Nodemailer
  - ✅ 3 HTML templates: welcome.html, verification.html, password-reset.html
  - ✅ SMTP config из environment variables
  - ✅ Ethereal email для dev-тестирования
- ✅ Rate limiting на login/register (уже было)
- ✅ Argon2 password hashing

---

### 💎 1.3 Premium Upsell Flow — ✅ РЕАЛИЗОВАНО
**Статус:** ✅ Полностью готово

**Реализовано:**
- ✅ `apps/web/src/pages/premium-page.tsx` — промо-страница VivaForm+
  - ✅ Hero section с gradient
  - ✅ Pricing cards (FREE vs PREMIUM) с highlight
  - ✅ Feature comparison table с Check/X иконками
  - ✅ Testimonials section (3 отзыва)
  - ✅ FAQ accordion (5 вопросов)
  - ✅ CTA section с dual buttons
- ✅ Stripe Webhook integration
  - ✅ `POST /webhooks/stripe` с signature verification
  - ✅ 4 event handlers:
    - checkout.session.completed → создание Subscription + update User.tier
    - invoice.payment_succeeded → обновление currentPeriodEnd
    - customer.subscription.updated → sync tier и status
    - customer.subscription.deleted → downgrade to FREE
- ✅ Premium gates
  - ✅ Meal Planner — strict premium gate с редиректом на /premium
  - ✅ Navigation bar — ✨ icon для premium features
- ✅ "View Plans" button на landing page

**Осталось (не критично):**
- [ ] Trial period (7 days) — требует дополнительной логики
- [ ] Subscription management UI в Settings (cancel, update payment, invoices)
- [ ] Social auth (Google, Apple) — опционально

---

### 📊 1.4 Dashboard Completion — ✅ БАЗОВО ГОТОВО
**Статус:** ✅ Основной функционал работает

**Реализовано:**
- ✅ GET `/dashboard/daily` endpoint — агрегирует все данные за день
- ✅ Nutrition Diary Widget
  - ✅ Add meal form (breakfast, lunch, dinner, snacks)
  - ✅ Manual input (food name, calories, protein, fat, carbs)
  - ✅ Daily summary card
  - ✅ Backend: `POST /nutrition`, `GET /nutrition?date=...`, `GET /nutrition/summary`
- ✅ Water Tracker Widget
  - ✅ Quick add form с кастомным input
  - ✅ Display entries за день
  - ✅ Backend: `POST /water`, `GET /water?date=...`, `GET /water/total`
- ✅ Weight Widget
  - ✅ Quick add weight entry с опциональной заметкой
  - ✅ Display latest weight + progress delta
  - ✅ Backend: `POST /weight`, `GET /weight/latest`, `GET /weight/progress`
- ✅ Recommendations Widget
  - ✅ Display personalized tips (если есть)
  - ✅ Backend: `POST /recommendations`, `GET /recommendations?date=...`
- ✅ Quick Stats Overview — calories, protein, water
- ✅ **Food Database Integration** — 60 продуктов в 12 категориях
  - ✅ `FoodItem` Prisma model с полной nutritional data
  - ✅ Seed: 60 verified foods (Fruits, Vegetables, Meat, Fish, Dairy, Grains, etc.)
  - ✅ Backend: `FoodService` + `FoodController`
  - ✅ API: `GET /nutrition/foods/search`, `GET /nutrition/foods/popular`, `GET /nutrition/foods/categories`
  - ✅ Frontend: `FoodAutocomplete` компонент с debouncing
  - ✅ Enhanced Nutrition Form с auto macro calculation
  - ✅ TypeScript types на всех уровнях

**Осталось (не критично для MVP):**
- [ ] Progress bars для целей (calories vs target, water vs daily goal)
- [ ] Mini charts в виджетах

---

## 🚀 Phase 2: Premium Features (Приоритет 2) — ✅ MEAL PLANNER ГОТОВ

### 🍽️ 2.1 Meal Planner (Premium) — ✅ MVP РЕАЛИЗОВАНО
**Статус:** ✅ Полностью готово БЕЗ внешних AI API

**Реализовано:**
- ✅ `apps/web/src/pages/meal-planner-page.tsx` (470 строк)
  - ✅ Premium gate UI — редирект на /premium если tier !== 'PREMIUM'
  - ✅ Weekly calendar navigation (7 дней)
  - ✅ Meal cards с expandable details (ingredients, instructions)
  - ✅ Macro progress bars (actual vs target)
  - ✅ Daily totals sidebar
  - ✅ Weekly averages summary
  - ✅ Regenerate button (refetch)
- ✅ Backend: MealPlanService (440 строк)
  - ✅ `GET /nutrition/meal-plan` endpoint с premium gate
  - ✅ MealTemplate модель в Prisma (25 готовых блюд)
  - ✅ Seed data: Mediterranean (8), Carnivore (6), Anti-Inflammatory (6), Snacks (5)
  - ✅ Алгоритм генерации:
    - ✅ Фильтрация по dietPlan, cookingTime, complexity, allergens, avoidedFoods
    - ✅ Расчёт целевых макросов по типу диеты (protein/fat/carbs ratios)
    - ✅ Scoring algorithm для подбора блюд (минимизация разницы с target)
    - ✅ Балансировка calories и macros на день
    - ✅ Исключение повторов в рамках дня
    - ✅ Генерация 7 дней с учётом mealsPerDay и skipBreakfast
- ✅ API типы: WeeklyMealPlan, DayPlan, MealPlanMeal
- ✅ Navigation link в AppShell с ✨ иконкой

**Соответствие спецификации:**
- ✅ "Персональные рекомендации (без внешнего AI)" — да, алгоритмическая логика
- ✅ "Генератор меню: Пример рациона на день/неделю" — 7 дней
- ✅ "с учётом цели и предпочтений" — учитывает TDEE, macros, dietPlan, allergies, avoidedFoods
- ✅ Premium-фича — строгий gate на backend и frontend

---

## 🎯 Phase 3: Analytics & Recommendations (Приоритет 3) — Следующий этап
  - [ ] База рецептов и продуктов
  - [ ] Расчёт калорий и макросов
  - [ ] Учёт предпочтений пользователя
  - [ ] `POST /api/meal-planner/generate`
- [ ] Display generated meal plan
  - [ ] Day-by-day breakdown
  - [ ] Recipes with ingredients
  - [ ] Shopping list generation
- [ ] Save/Edit meal plans
- [ ] Export meal plan (PDF/CSV)
- [ ] Тесты meal planner

---

### 📈 2.2 Advanced Analytics (Premium)
**Статус:** ⚠️ Базовые графики есть, нужна аналитика

**Задачи:**
- [ ] Extended Progress Page
  - [ ] Weight chart: 30/90/365 days views
  - [ ] Calorie intake trends
  - [ ] Macro balance over time
  - [ ] Compare weeks/months
- [ ] Insights & Patterns
  - [ ] "This week vs last week" summary
  - [ ] Streak tracking (logging consistency)
  - [ ] Goal achievement indicators
- [ ] Custom date range selection
- [ ] Backend aggregation endpoints
  - [ ] `GET /api/analytics/weight-trends`
  - [ ] `GET /api/analytics/nutrition-summary`
- [ ] Data export (PDF/CSV)
  - [ ] Full history export
  - [ ] Formatted reports
  - [ ] Backend: `GET /api/export/data`
- [ ] Тесты analytics

---

### 🤖 2.3 Smart Recommendations Engine (Premium)
**Статус:** ⚠️ Структура есть, нужен алгоритм

**Описание:** Автоматическая система советов без внешнего AI

**Задачи:**
- [ ] Backend recommendation algorithms
  - [ ] Анализ дневника питания
    - Если белка < цели → "Add more protein sources"
    - Если калорий постоянно ниже → "Increase portions"
    - Если вес не меняется 2+ недели → "Adjust activity level"
  - [ ] Анализ трендов веса
  - [ ] Анализ паттернов логирования
  - [ ] Сезонность и контекст
- [ ] Recommendation priority & scoring
- [ ] `GET /api/recommendations/personalized`
- [ ] UI для отображения рекомендаций
  - [ ] Category cards (Nutrition, Activity, Habits)
  - [ ] Actionable tips
  - [ ] "Mark as done" / "Dismiss"
- [ ] Notification system для важных рекомендаций
- [ ] Тесты recommendation engine

---

### 🔄 2.4 Integrations (Premium)
**Статус:** ❌ Отсутствует

**Задачи:**
- [ ] Apple Health integration
  - [ ] iOS app: HealthKit API
  - [ ] Sync weight, activity, water
  - [ ] Backend: store sync status
- [ ] Google Fit integration
  - [ ] Android app: Google Fit API
  - [ ] Sync weight, steps, calories burned
- [ ] Settings page: Integrations section
  - [ ] Connect/Disconnect buttons
  - [ ] Sync status & last sync time
  - [ ] Manual sync trigger
- [ ] Тесты integrations

---

## 📱 Phase 3: Mobile Apps (Приоритет 3) — 4-5 недель

### 3.1 Expo Mobile Foundation
**Статус:** ⚠️ Структура проекта есть, нужна реализация

**Задачи:**
- [ ] Setup Expo Router navigation
- [ ] Shared components library
- [ ] Auth flow (login/register)
- [ ] Secure token storage (Expo SecureStore)
- [ ] API client (React Query)
- [ ] Push notifications setup
  - [ ] Expo Notifications
  - [ ] Backend: send notifications
  - [ ] Notification preferences
- [ ] App icons & splash screens
- [ ] EAS Build configuration

---

### 3.2 Mobile Core Features
**Задачи:**
- [ ] Dashboard screen (mobile-optimized)
- [ ] Nutrition logging (mobile UI)
- [ ] Water tracker (quick add buttons)
- [ ] Weight logging with camera input
- [ ] Progress charts (mobile-friendly)
- [ ] Settings & profile
- [ ] Offline support (SQLite cache)
- [ ] Pull-to-refresh

---

### 3.3 Mobile-Specific Features
**Задачи:**
- [ ] Home screen widgets (iOS/Android)
  - [ ] Quick water log
  - [ ] Today's progress
  - [ ] Weight trend
- [ ] Camera features
  - [ ] Scan food labels (OCR)
  - [ ] Photo meal logging
- [ ] Reminders & notifications
  - [ ] Meal reminders
  - [ ] Water reminders
  - [ ] Weigh-in reminders
- [ ] Apple Health / Google Fit sync
- [ ] App Store & Google Play submission

---

## 🎨 Phase 4: Polish & Marketing (Приоритет 4) — 2-3 недели

### 4.1 UI/UX Improvements
**Задачи:**
- [ ] Accessibility audit (WCAG 2.1 AA)
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] Color contrast
- [ ] Loading states & skeletons
- [ ] Error boundaries
- [ ] Empty states design
- [ ] Onboarding tooltips
- [ ] Micro-interactions & animations
- [ ] Responsive design audit
- [ ] Performance optimization
  - [ ] Lazy loading
  - [ ] Code splitting
  - [ ] Image optimization

---

### 4.2 Content & Marketing
**Задачи:**
- [ ] Blog/Articles section
  - [ ] 10-15 SEO-оптимизированных статей
  - [ ] Nutrition tips, habit formation, success stories
- [ ] Help Center / FAQ
  - [ ] Comprehensive documentation
  - [ ] Video tutorials
- [ ] Email campaigns
  - [ ] Welcome series
  - [ ] Weekly tips
  - [ ] Re-engagement emails
- [ ] Social proof
  - [ ] User testimonials
  - [ ] Success stories с before/after
  - [ ] Trust badges
- [ ] Landing page A/B testing
  - [ ] Different headlines
  - [ ] CTA variations
  - [ ] Pricing presentation

---

### 4.3 Analytics & Monitoring
**Задачи:**
- [ ] Event tracking setup
  - [ ] User journey events
  - [ ] Feature usage analytics
  - [ ] Conversion funnels
- [ ] Error monitoring (Sentry)
- [ ] Performance monitoring
  - [ ] Core Web Vitals
  - [ ] API response times
- [ ] User feedback system
  - [ ] In-app feedback form
  - [ ] NPS surveys
- [ ] A/B testing infrastructure

---

## 🔧 Phase 5: Infrastructure & Scale (Ongoing)

### 5.1 Backend Improvements
**Задачи:**
- [ ] Caching strategy (Redis)
  - [ ] Dashboard data
  - [ ] Recommendations
  - [ ] User sessions
- [ ] Database optimization
  - [ ] Indexing audit
  - [ ] Query optimization
  - [ ] Connection pooling
- [ ] API versioning
- [ ] Rate limiting refinement
- [ ] Background jobs (BullMQ)
  - [ ] Email sending
  - [ ] Recommendation generation
  - [ ] Data exports
- [ ] Logging & tracing (OpenTelemetry)

---

### 5.2 Testing & Quality
**Задачи:**
- [ ] Unit tests coverage (80%+)
  - [ ] Backend services
  - [ ] Frontend components
  - [ ] Utilities
- [ ] Integration tests
  - [ ] API endpoints
  - [ ] Auth flow
  - [ ] Payment flow
- [ ] E2E tests (Playwright)
  - [ ] Critical user journeys
  - [ ] Cross-browser testing
- [ ] Load testing
  - [ ] API stress testing
  - [ ] Database performance
- [ ] Security audit
  - [ ] OWASP top 10
  - [ ] Dependency vulnerabilities
  - [ ] Penetration testing

---

### 5.3 DevOps & CI/CD
**Задачи:**
- [ ] GitHub Actions workflows
  - [ ] Automated tests on PR
  - [ ] Lint & type checking
  - [ ] Build validation
- [ ] Staging environment
- [ ] Preview deployments (Vercel)
- [ ] Database migrations strategy
- [ ] Backup & disaster recovery
- [ ] Monitoring & alerting
  - [ ] Uptime monitoring
  - [ ] Error rate alerts
  - [ ] Performance degradation alerts

---

## 📅 Рекомендуемая последовательность

### Ближайшие 2 недели (Must-Have)
1. **Onboarding Quiz** — без него пользователь не может персонализировать опыт
2. **Auth improvements** — forgot password critical для UX
3. **Dashboard nutrition diary** — core feature для daily usage
4. **Premium upsell page** — нужен для монетизации

### Следующие 2-4 недели
5. **Meal Planner** — killer feature для премиум
6. **Advanced Analytics** — дополнительная ценность премиума
7. **Smart Recommendations** — уникальное преимущество

### Средний срок (1-2 месяца)
8. **Mobile apps** — расширение аудитории
9. **Integrations** — competitive advantage
10. **Marketing & content** — user acquisition

### Долгосрочно (3+ месяцев)
11. **Scale infrastructure**
12. **Advanced features** (social, gamification, coach matching)
13. **International expansion**

---

## 🎯 Quick Wins (можно сделать прямо сейчас)

1. **Forgot Password flow** (1-2 дня) — критично для UX
2. **Premium page UI** (1 день) — монетизация
3. **Add meal form** (2-3 дня) — core feature
4. **Email verification** (1 день) — security
5. **Loading states** (1 день) — polish
6. **Tests для auth pages** (1 день) — quality

---

## 📊 Метрики успеха

### User Acquisition
- 1,000 completed quizzes в первый месяц
- 10% conversion quiz → registration
- 20% activation rate (logged meal/weight after signup)

### Monetization
- 5% free → premium conversion
- $10,000 MRR в первые 3 месяца
- 80%+ subscription retention

### Engagement
- 60%+ DAU/MAU ratio
- 3+ sessions per week
- 5+ meals logged per week

### Technical
- 99.9% uptime
- <200ms API response time (p95)
- <2s page load time
- 0 critical bugs in production

---

## 🤔 Вопросы для обсуждения

1. **Приоритет Mobile vs Web?** — стартовать с Web, затем Mobile или параллельно?
2. **MVP границы** — какой минимум нужен для запуска?
3. **Pricing strategy** — trial период обязателен? Lifetime deal?
4. **Content strategy** — нужна ли блог-платформа или хватит статичных страниц?
5. **Team size** — кто будет работать над проектом?

---

*Дорожная карта живая и будет обновляться по мере развития проекта.*
