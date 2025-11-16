# 🎯 План улучшений квиза VivaForm

**Дата:** 2025-11-16
**Цель:** Оптимизировать квиз для максимальной конверсии и улучшения UX

---

## 📊 ТЕКУЩЕЕ СОСТОЯНИЕ

### Проблемы:
- ❌ **38 шагов** — слишком длинный квиз (оптимум: 12-15)
- ❌ **Нет email capture** — теряем 60-70% потенциальных лидов
- ❌ **Premium upsell в конце** — низкая конверсия в платную подписку
- ❌ **Отсутствуют изображения** — /public/images/quiz/ не существует
- ❌ **Дублирование конфигов** — enhanced-quiz-config.ts не используется
- ❌ **Нет social proof** — недостаточно доверия

### Что работает хорошо:
- ✅ Gamification (badges, phases)
- ✅ Mobile-first дизайн
- ✅ Autosave прогресса
- ✅ Dual units (US/Metric)
- ✅ Exit intent modal
- ✅ Условная логика

---

## 🎯 НОВАЯ ОПТИМИЗИРОВАННАЯ СТРУКТУРА КВИЗА

**Цель:** 12 ключевых шагов с высокой конверсией

### **Воронка:**
```
HOOK (1-3) → QUALIFY (4-6) → EMAIL (7) → DEEPEN (8-10) → UPSELL (11) → CONVERT (12)
```

---

## 📝 ДЕТАЛЬНАЯ СТРУКТУРА (12 ШАГОВ)

### **PHASE 1: HOOK — Зацепить внимание (Шаги 1-3)**

#### **Шаг 1: Welcome Screen**
- **ID:** `welcome`
- **Тип:** `info` / `full_screen_intro`
- **Заголовок:** "Find a nutrition plan that actually fits your life"
- **Подзаголовок:** "Get your personalized plan in 2 minutes — based on real science, not fad diets"
- **CTA:** "Start Your Quiz →"
- **Визуал:** Hero image или видео (успешные трансформации)
- **Microcopy:** "✓ 50,000+ people transformed | ✓ No credit card needed"

**Маркетинг:**
- Social proof: "50,000+ успешных клиентов"
- Trust badges: научные исследования, сертификаты
- Без обязательств

---

#### **Шаг 2: Primary Goal**
- **ID:** `primary_goal`
- **Тип:** `single_choice` / `cards_grid`
- **Вопрос:** "What's your main health goal?"
- **Варианты:**
  - 🎯 **Lose weight** — Reduce body fat in a healthy way
  - 💪 **Build muscle** — Gain strength and lean mass
  - ⚖️ **Maintain weight** — Stay healthy and balanced
  - ⚡ **More energy** — Feel energized all day

**Маркетинг:**
- Крупные визуальные карточки
- Эмоциональный язык
- Микро-анимации при наведении

**Логика:**
```javascript
// Условие: если выбрано "maintain", пропускаем target weight позже
if (answer === 'maintain') {
  skipSteps: ['target_weight']
}
```

---

#### **Шаг 3: Body Metrics (Height & Weight)**
- **ID:** `body_metrics`
- **Тип:** `number_inputs` / `split_vertical_inputs`
- **Вопрос:** "Let's get your starting point"
- **Подзаголовок:** "We'll calculate your personalized calorie needs — no judgment, just data"
- **Поля:**
  - Unit toggle: 🇺🇸 US (ft/in, lbs) | 🌍 Metric (cm, kg)
  - Height input (с валидацией)
  - Weight input (с валидацией)
- **BMI Preview:** Показываем расчет BMI в реальном времени

**UX:**
- Live preview BMI по мере ввода
- Microcopy: "An estimate is enough — you don't need perfect measurements"
- Прогресс: 25% completed

---

### **PHASE 2: QUALIFY — Квалифицировать лид (Шаги 4-6)**

#### **Шаг 4: Activity Level**
- **ID:** `activity_level`
- **Тип:** `single_choice` / `cards_list`
- **Вопрос:** "How active are you on a typical week?"
- **Подзаголовок:** "Honesty makes your plan better — no need to impress us"
- **Варианты:**
  - 🛋️ **Sedentary** — Mostly sitting (desk job, little movement)
  - 🚶 **Lightly active** — Some walking, no regular workouts
  - 🏃 **Moderately active** — 2-3 workouts per week
  - 🏋️ **Very active** — 4+ workouts or physically demanding job

**Маркетинг:**
- Не осуждаем, а поддерживаем
- "We'll adjust your plan to match your reality"

---

#### **Шаг 5: Food Preferences**
- **ID:** `food_preferences`
- **Тип:** `multi_choice` / `chips_wrap`
- **Вопрос:** "What do you genuinely enjoy eating?"
- **Подзаголовок:** "Your plan should include foods you actually like — not force you to eat kale"
- **Варианты (множественный выбор):**
  - 🥩 Meat & poultry
  - 🐟 Fish & seafood
  - 🥗 Vegetables & salads
  - 🍎 Fruits
  - 🍞 Grains & bread
  - 🥛 Dairy
  - 🍰 Sweet foods
  - 🍔 Fast food (yes, it's okay!)

**Маркетинг:**
- Позитивный фрейминг: "what you LIKE", не "what you avoid"
- Включаем "нездоровые" варианты — честность важна

---

#### **Шаг 6: 🍽️ DIET PLAN CHOICE** ⭐ **ОБЯЗАТЕЛЬНЫЙ**
- **ID:** `diet_plan_choice`
- **Тип:** `single_choice` / `cards_grid`
- **Вопрос:** "Which diet plan are you interested in?"
- **Подзаголовок:** "We'll customize your approach based on what works for you"
- **Варианты:**

  **🫒 Mediterranean**
  - Subtitle: "Balanced, heart-healthy nutrition"
  - Description: "Rich in veggies, healthy fats (olive oil), fish, whole grains. Best for long-term health and weight loss."
  - Benefits: ✓ Heart health ✓ Anti-inflammatory ✓ Easy to follow

  **🥩 Carnivore**
  - Subtitle: "Animal-based, zero-carb approach"
  - Description: "Mostly meat, fish, eggs. Very low carbs. Consult your doctor first if you have health conditions."
  - Benefits: ✓ Simple rules ✓ High protein ✓ Fast results
  - Warning: ⚠️ Requires medical supervision for chronic conditions

  **🌿 Anti-Inflammatory**
  - Subtitle: "Reduce inflammation, boost wellness"
  - Description: "Focus on whole foods, omega-3s, antioxidants. Great for joint pain, digestion, energy."
  - Benefits: ✓ Reduces pain ✓ Better digestion ✓ More energy

**Логика:**
```javascript
// Условие: если Carnivore + health conditions, показываем safety check
if (answer === 'carnivore' && hasHealthConditions()) {
  nextStep: 'carnivore_safety_check'
} else {
  nextStep: 'email_capture'
}
```

**Маркетинг:**
- Визуальные карточки с иконками
- Подробные описания пользы
- Не критикуем ни один подход
- Safety-first подход для Carnivore

---

### **PHASE 3: EMAIL CAPTURE 📧 (Шаг 7)**

#### **Шаг 7: Email Capture** ⭐ **КРИТИЧНО ДЛЯ КОНВЕРСИИ**
- **ID:** `email_capture`
- **Тип:** `text_short` / custom email input
- **Вопрос:** "Where should we send your personalized plan? 📧"
- **Подзаголовок:** "Get instant access to your custom nutrition roadmap"
- **Поле:** Email input с валидацией
- **Microcopy:**
  - "✓ We'll never spam you"
  - "✓ Unsubscribe anytime"
  - "✓ Your data is 100% secure"

**Маркетинг:**
- **Trigger:** Показываем ПОСЛЕ того как:
  - ✅ Пользователь вовлечен (6 вопросов пройдено)
  - ✅ Увидел персонализацию (BMI, диета)
  - ✅ Чувствует commitment
- **Social proof:** "Join 50,000+ who transformed their health"
- **Urgency:** "Get your plan in 60 seconds"
- **Визуал:** Показываем preview плана (blurred) с подписью "Unlock your results"

**Анти-abandonment:**
- Exit intent popup если пытаются уйти:
  - "Wait! You're 60% done. Save your progress?"
  - Quick email capture
  - Promise: "We'll email you a link to continue"

---

### **PHASE 4: DEEPEN — Углубить персонализацию (Шаги 8-10)**

#### **Шаг 8: Health Conditions (Optional)**
- **ID:** `health_conditions`
- **Тип:** `multi_choice` / `chips_wrap`
- **Вопрос:** "Do you have any of these health situations? (Optional)"
- **Подзаголовок:** "This helps us personalize your plan — it doesn't replace a doctor"
- **Варианты:**
  - Digestive issues (bloating, IBS)
  - Blood sugar issues / diabetes
  - High blood pressure
  - Joint pain / inflammation
  - Hormonal issues (PCOS, thyroid)
  - None / prefer not to say

**Маркетинг:**
- Опционально — не давим
- "We'll avoid recommendations that ignore these realities"
- Empathy-driven язык

---

#### **Шаг 9: Eating Habits**
- **ID:** `eating_habits`
- **Тип:** `single_choice` / `cards_grid`
- **Вопрос:** "Which eating pattern looks most like your usual day?"
- **Подзаголовок:** "Your plan will start from your current pattern, not an ideal one"
- **Варианты:**
  - 2 big meals, not many snacks (IF-friendly)
  - 3-4 regular meals (traditional)
  - Mostly snacking through the day
  - Chaotic — every day is different

**Логика:**
```javascript
// Используем для подбора meal timing
if (answer === '2_meals') {
  recommendIntermittentFasting = true
}
```

---

#### **Шаг 10: Budget Level**
- **ID:** `budget_level`
- **Тип:** `single_choice` / `cards_grid`
- **Вопрос:** "What's your weekly food budget?"
- **Подзаголовок:** "Being realistic here prevents frustration later"
- **Варианты:**
  - 💵 **Budget** — Keep it as low as possible (<$50/week)
  - 💳 **Moderate** — Normal, flexible ($50-100/week)
  - 💰 **Comfortable** — Quality matters ($100-150/week)
  - 💎 **Premium** — Best ingredients ($150+/week)

**Маркетинг:**
- Не осуждаем низкий бюджет
- "Your plan should fit your wallet AND your body"

---

### **PHASE 5: UPSELL 💎 (Шаг 11)**

#### **Шаг 11: Premium Offer (Mid-Funnel Upsell)**
- **ID:** `premium_offer_midpoint`
- **Тип:** `info` / `comparison_cards`
- **Заголовок:** "🎉 You're almost done! Here's what happens next..."
- **Подзаголовок:** "We're finalizing your personalized plan. Choose how you want to access it:"

**Comparison:**

| **FREE Plan** | **PREMIUM Plan** ⭐ |
|--------------|---------------------|
| ✓ Basic nutrition plan | ✓ Everything in Free |
| ✓ BMI & calorie calculator | ✓ **Dynamic meal plans** (updates weekly) |
| ✓ General food lists | ✓ **Exact recipes** with macros |
| • No meal plans | ✓ **Smart grocery lists** |
| • No tracking | ✓ **Habit tracker** with reminders |
| • Community only | ✓ **Priority support** |
|  | ✓ **Progress analytics** |
| **$0/month** | **$19.99/month** (Cancel anytime) |

**CTA:**
- 🚀 **Primary:** "Unlock Premium — First 7 days free"
- 🆓 **Secondary:** "Continue with Free plan"

**Маркетинг:**
- **Timing:** Середина воронки (после email, перед результатами)
- **Framing:** "Most people who want faster results choose Premium"
- **Risk reversal:** "7-day free trial, cancel anytime"
- **Scarcity:** "🔥 Only 23 Premium spots left this week"
- **Social proof:** "⭐ 4.8/5 from 12,000+ members"

**Psychological triggers:**
- ✅ Anchoring: показываем сначала дорогой annual plan ($199/year), потом monthly ($19.99)
- ✅ Reciprocity: "You've shared so much with us, we want to give you the best"
- ✅ FOMO: "Limited spots for personalized support"

---

### **PHASE 6: CONVERT 🎯 (Шаг 12)**

#### **Шаг 12: Results Preview & Final CTA**
- **ID:** `results_final`
- **Тип:** `info` / `summary_bullets`
- **Заголовок:** "🎉 Your Personalized Plan is Ready!"
- **Подзаголовок:** "Based on your answers, here's what we recommend:"

**Показываем:**
```
✅ Your Profile:
   • Goal: Lose 15 lbs
   • Current BMI: 27.3 (Overweight)
   • Target BMI: 23.5 (Healthy)
   • Activity: Moderately active

✅ Your Plan: Mediterranean Diet
   • Daily calories: 1,800 kcal
   • Protein: 135g | Carbs: 180g | Fat: 60g
   • Meal timing: 3 meals + 1 snack

✅ Expected Results:
   📉 Lose 1.5 lbs/week
   ⏱️ Reach goal in ~10 weeks
   ⚡ More energy in 7 days

✅ Next Steps:
   1. Check your email for full plan
   2. Start your first meal today
   3. Track progress in the app
```

**CTA:**
- 🎯 **Primary:** "View My Full Plan in App →"
- 📧 **Secondary:** "Email me the plan"

**Если не залогинен:**
- Redirect → `/register?quiz_completed=true`
- Save quiz data в localStorage
- После регистрации → автоматически создаем план

**Если залогинен:**
- Submit quiz → Backend
- Redirect → `/app/dashboard` (с новым планом)

---

## 🔧 ТЕХНИЧЕСКИЕ УЛУЧШЕНИЯ

### 1. **Email Capture Implementation**

**API endpoint:**
```typescript
POST /api/quiz/capture-email
{
  "email": "user@example.com",
  "clientId": "uuid",
  "step": 7,
  "partialAnswers": { ... },
  "type": "midpoint" // or "exit_intent"
}
```

**Backend:**
- Сохраняем в таблицу `quiz_leads`
- Trigger email: "Your plan is waiting! Continue where you left off"
- Retry механизм если API недоступен

**Frontend:**
```typescript
// quiz-config.ts
{
  id: 'email_capture',
  type: 'text_short',
  validation: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  onComplete: async (email) => {
    await captureQuizEmail({
      email,
      clientId,
      step: currentStep,
      partialAnswers: answers,
      type: 'midpoint'
    });
  }
}
```

---

### 2. **Image Fallback System**

**Проблема:** `/public/images/quiz/` не существует

**Решение:**
```typescript
// components/quiz/option-tile.tsx
function OptionTile({ imageUrl, emoji, title }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="option-card">
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={title}
          onError={() => setImageError(true)}
          className="option-image"
        />
      ) : (
        <div className="emoji-fallback">{emoji || '📋'}</div>
      )}
      <h3>{title}</h3>
    </div>
  );
}
```

**Альтернатива:** Использовать emoji везде (быстрее, легче, работает offline)

---

### 3. **Удалить дублирующий конфиг**

```bash
rm /apps/web/src/features/quiz/enhanced-quiz-config.ts
```

Оставить только один источник истины: `quiz-config.ts`

---

### 4. **Условная логика для Carnivore**

```typescript
// quiz-config.ts - Carnivore Safety Check
{
  id: 'carnivore_safety_check',
  conditional: {
    dependsOn: ['diet_plan_choice', 'health_conditions'],
    rule: 'carnivore_with_chronic_conditions'
  },
  question: 'Important: Safety check for Carnivore diet',
  subtitle: 'You selected Carnivore and mentioned health conditions. This diet requires medical supervision.',
  options: [
    {
      value: 'keep_carnivore',
      label: 'Keep Carnivore (I'll discuss with my doctor)',
      description: 'Recommended: Consult a healthcare provider first'
    },
    {
      value: 'switch_safe',
      label: 'Switch to Mediterranean or Anti-Inflammatory',
      description: 'Safer option for most health conditions'
    }
  ]
}
```

**Логика:**
```typescript
function shouldShowStep(step: QuizStep, answers: QuizAnswers): boolean {
  if (step.id === 'carnivore_safety_check') {
    return (
      answers.diet_plan_choice === 'carnivore' &&
      answers.health_conditions?.some(c => c !== 'none')
    );
  }
  return true;
}
```

---

### 5. **Social Proof Elements**

**Добавить на ключевые шаги:**

```typescript
// Шаг 1: Welcome
<SocialProof>
  ⭐⭐⭐⭐⭐ 4.8/5 from 12,000+ users
  "I lost 22 lbs in 8 weeks!" - Sarah M.
  "Finally a plan that fits my life" - Mike T.
</SocialProof>

// Шаг 7: Email Capture
<TrustBadges>
  🔒 SSL Encrypted
  ✓ GDPR Compliant
  ✓ No spam, ever
  ✓ 50,000+ people trust us
</TrustBadges>

// Шаг 11: Premium Upsell
<Testimonials>
  "Premium changed my life. The meal plans saved me 5 hours/week"
  - Jennifer K., Premium member
</Testimonials>
```

---

## 📈 A/B TESTING ПЛАН

### Тесты для запуска:

**Test 1: Email Capture Timing**
- Variant A: Email на шаге 7 (после diet choice) ← Рекомендую
- Variant B: Email на шаге 4 (раньше)
- Metric: Email capture rate

**Test 2: Premium Upsell Position**
- Variant A: Mid-funnel (шаг 11) ← Рекомендую
- Variant B: End-funnel (после results)
- Metric: Premium conversion rate

**Test 3: Quiz Length**
- Variant A: 12 шагов ← Рекомендую
- Variant B: 8 шагов (ultra-short)
- Metric: Completion rate, lead quality

**Test 4: Diet Question Framing**
- Variant A: "Which diet plan are you interested in?" ← Текущая
- Variant B: "Which eating style sounds best for you?"
- Metric: Carnivore selection rate

---

## 📊 SUCCESS METRICS

### KPIs для отслеживания:

**Funnel Metrics:**
- Quiz start rate: >60% (from landing page)
- Step 7 completion: >70% (email capture)
- Full quiz completion: >50%
- Email capture rate: >60%
- Premium conversion: >15%

**Engagement:**
- Average time on quiz: 3-4 минуты
- Back button usage: <20%
- Exit rate per step: <10%

**Quality:**
- Email validation pass rate: >95%
- Spam/fake emails: <5%
- Plan activation rate: >40% (после получения)

---

## 🚀 IMPLEMENTATION ROADMAP

### **Phase 1: Critical Fixes (Week 1)**
- [ ] Удалить enhanced-quiz-config.ts
- [ ] Добавить email capture на шаг 7
- [ ] Создать image fallback систему
- [ ] Добавить обязательный вопрос "Which diet plan"
- [ ] Сократить квиз до 12 шагов

### **Phase 2: Optimization (Week 2)**
- [ ] Переместить premium upsell на шаг 11
- [ ] Добавить social proof элементы
- [ ] Улучшить микрокопирайтинг
- [ ] Добавить условную логику (skip steps)
- [ ] A/B тесты настроить

### **Phase 3: Polish (Week 3)**
- [ ] Добавить анимации и transitions
- [ ] Улучшить mobile UX
- [ ] Добавить progress celebration микро-моменты
- [ ] Exit intent optimization
- [ ] Email drip campaign после capture

---

## 📝 ИЗМЕНЕННЫЕ ФАЙЛЫ

```
apps/web/src/features/quiz/
  ├── quiz-config.ts (REWRITE — 12 steps)
  ├── enhanced-quiz-config.ts (DELETE)
  └── funnel-engine.tsx (UPDATE)

apps/web/src/components/quiz/
  ├── quiz-step-renderer.tsx (UPDATE — email input)
  ├── option-tile.tsx (UPDATE — image fallback)
  └── social-proof.tsx (NEW)

apps/web/src/pages/
  └── quiz-page.tsx (UPDATE — email logic)

apps/backend/src/modules/quiz/
  ├── quiz.controller.ts (ADD — capture-email endpoint)
  └── quiz.service.ts (UPDATE)
```

---

## 🎯 ФИНАЛЬНАЯ СТРУКТУРА (12 ШАГОВ)

```
1. Welcome Screen (splash)
2. Primary Goal (lose/gain/maintain/energy)
3. Body Metrics (height, weight, BMI preview)
4. Activity Level (sedentary → very active)
5. Food Preferences (what you like)
6. ⭐ Diet Plan Choice (Mediterranean/Carnivore/Anti-Inflammatory)
7. 📧 Email Capture ← CRITICAL!
8. Health Conditions (optional, for safety)
9. Eating Habits (meal timing pattern)
10. Budget Level (low → premium)
11. 💎 Premium Upsell (free vs premium)
12. 🎉 Results Preview & CTA
```

**+ Условный шаг:**
- 6a. Carnivore Safety Check (если Carnivore + health conditions)

---

## ✅ NEXT STEPS

1. **Review этот план** с командой/стейкхолдерами
2. **Утвердить финальную структуру** (12 шагов)
3. **Начать имплементацию** с Phase 1
4. **A/B тесты** запустить параллельно

---

**Questions?** Готов начать имплементацию или нужны корректировки?
