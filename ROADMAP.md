# 🗺️ VivaForm Development Roadmap

## 📋 Текущий статус проекта (ноябрь 2025)

### ✅ Уже реализовано

**Frontend (Web)**
- ✅ Landing page с улучшенными текстами и анимациями
- ✅ Базовая аутентификация (login/register)
- ✅ Dashboard с виджетами
- ✅ Progress page (графики веса)
- ✅ Recommendations page (базовая структура)
- ✅ Settings page
- ✅ Theme toggle (dark/light mode)
- ✅ Support widget
- ✅ Comprehensive тесты (landing + widget)
- ✅ Analytics integration (Meta Pixel + Google Ads готовы)

**Backend**
- ✅ NestJS API structure
- ✅ Prisma + PostgreSQL
- ✅ JWT + Refresh tokens
- ✅ Stripe integration (webhooks, subscriptions)
- ✅ Базовые модули (auth, users, dashboard, weight, water, nutrition, recommendations)
- ✅ Security (Helmet, CORS, rate limiting)

**Infrastructure**
- ✅ Monorepo (Turborepo + pnpm)
- ✅ TypeScript everywhere
- ✅ Vite 6 + React 19
- ✅ Tailwind CSS 4 + Radix UI

---

## 🎯 Phase 1: Core User Journey (Приоритет 1) — 2-3 недели

### 🎪 1.1 Onboarding Quiz (Критично!)
**Статус:** ❌ Отсутствует  
**Описание:** Интерактивный квиз из ~40 вопросов для персонализации

**Задачи:**
- [ ] Создать `apps/web/src/pages/quiz-page.tsx`
- [ ] Разработать state machine для квиза (Zustand или XState)
- [ ] Дизайн UI: progress bar, плавные переходы между вопросами
- [ ] Группы вопросов:
  - Базовые: пол, возраст, рост, текущий вес, целевой вес
  - Активность: уровень физической активности, тип работы
  - Питание: режим питания, предпочтения (вегетарианство, аллергии)
  - Цели: похудение/набор/поддержание, временные рамки
  - Привычки: вода, сон, стресс
- [ ] Сохранение промежуточных результатов (localStorage)
- [ ] Валидация ответов
- [ ] Backend endpoint: `POST /api/quiz/submit`
- [ ] Автоматический расчёт TDEE и макросов после завершения
- [ ] Тесты для quiz flow

**Зависимости:** Backend `/quiz` module

---

### 🔐 1.2 Улучшение Auth Flow
**Статус:** ⚠️ Базовая реализация есть, нужны улучшения

**Задачи:**
- [ ] Forgot Password flow
  - [ ] `apps/web/src/pages/forgot-password-page.tsx`
  - [ ] Backend: `POST /api/auth/forgot-password`
  - [ ] Email с ссылкой восстановления
  - [ ] `apps/web/src/pages/reset-password-page.tsx`
- [ ] Email verification
  - [ ] Отправка письма после регистрации
  - [ ] `GET /api/auth/verify-email/:token`
  - [ ] Страница подтверждения
- [ ] Social auth (опционально)
  - [ ] Google OAuth
  - [ ] Apple Sign In
- [ ] Rate limiting на login/register
- [ ] Captcha для предотвращения ботов
- [ ] Тесты auth flows

---

### 💎 1.3 Premium Upsell Flow
**Статус:** ⚠️ Stripe интеграция есть, UI flow отсутствует

**Задачи:**
- [ ] `apps/web/src/pages/premium-page.tsx` — промо-страница VivaForm+
  - Benefits comparison table (Free vs Premium)
  - Pricing cards с тремя планами
  - Testimonials section
  - FAQ специфичный для подписки
- [ ] Stripe Checkout integration
  - [ ] Кнопка "Subscribe" → Stripe Checkout Session
  - [ ] Success callback page (`/premium/success`)
  - [ ] Cancel callback page (`/premium/cancel`)
- [ ] Trial period (7 days)
  - [ ] Backend логика проверки триала
  - [ ] UI баннер "X days left in trial"
- [ ] Subscription management
  - [ ] View current plan в Settings
  - [ ] Cancel subscription
  - [ ] Update payment method
  - [ ] Invoice history
- [ ] Premium gates по всему приложению
  - [ ] Upgrade prompts в нужных местах
  - [ ] Disable premium features для Free users
- [ ] Тесты checkout flow

---

### 📊 1.4 Dashboard Completion
**Статус:** ⚠️ Базовая структура есть, нужно наполнение

**Задачи:**
- [ ] Nutrition Diary Widget
  - [ ] Add meal form (breakfast, lunch, dinner, snacks)
  - [ ] Food search/autocomplete (база продуктов)
  - [ ] Macro calculation (calories, protein, carbs, fats)
  - [ ] Daily summary card
  - [ ] Backend: `POST /api/nutrition/meals`, `GET /api/nutrition/daily-summary`
- [ ] Water Tracker Widget
  - [ ] Quick add buttons (250ml, 500ml, 750ml, custom)
  - [ ] Progress bar до цели
  - [ ] Backend: `POST /api/water/log`, `GET /api/water/today`
- [ ] Weight Widget
  - [ ] Quick add weight entry
  - [ ] Mini chart (last 7 days)
  - [ ] Backend уже есть: `/api/weight/*`
- [ ] Recommendations Widget
  - [ ] Display personalized tips
  - [ ] "See all recommendations" link
  - [ ] Backend: `/api/recommendations/today`
- [ ] Quick Stats Overview
  - [ ] Today's calories vs target
  - [ ] Macro balance
  - [ ] Weight trend
- [ ] Тесты dashboard widgets

---

## 🚀 Phase 2: Premium Features (Приоритет 2) — 3-4 недели

### 🍽️ 2.1 Meal Planner (Premium)
**Статус:** ❌ Отсутствует

**Задачи:**
- [ ] `apps/web/src/pages/meal-planner-page.tsx`
- [ ] UI для генерации меню
  - [ ] Параметры: дней (1/3/7), тип диеты, исключения
  - [ ] "Generate Plan" button
- [ ] Backend: Meal plan generation algorithm
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
