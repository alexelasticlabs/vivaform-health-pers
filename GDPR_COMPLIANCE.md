# GDPR Compliance & Medical Disclaimers

Руководство по соблюдению GDPR и юридическим требованиям для VivaForm.

## Медицинские дисклеймеры

### Главный дисклеймер

**Расположение**: Footer на всех страницах, About page, FAQ

```
⚠️ Медицинский дисклеймер

VivaForm — это информационный инструмент для отслеживания питания и здоровья.
Приложение НЕ ЗАМЕНЯЕТ профессиональную медицинскую консультацию, диагностику 
или лечение.

Всегда консультируйтесь с квалифицированным врачом или диетологом перед началом
любой диеты, программы упражнений или изменением образа жизни.

Если у вас есть медицинские заболевания, аллергии или принимаете лекарства,
обязательно проконсультируйтесь со специалистом перед использованием наших
рекомендаций.

В случае неотложной медицинской помощи немедленно обратитесь к врачу или
вызовите скорую помощь.
```

### Дисклеймер на странице рекомендаций

```tsx
// apps/web/src/components/medical-disclaimer.tsx
export function MedicalDisclaimer() {
  return (
    <div className="medical-disclaimer bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Важно: Медицинский дисклеймер
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Эти рекомендации носят информационный характер и не заменяют 
              консультацию врача или диетолога. Перед изменением диеты или 
              физической активности проконсультируйтесь со специалистом.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### AI-Generated Content Disclaimer

```
🤖 Контент сгенерирован ИИ

Рекомендации по питанию создаются с помощью искусственного интеллекта на основе
ваших данных и общих рекомендаций по здоровому питанию. Они не учитывают все
индивидуальные особенности вашего здоровья.

ИИ может ошибаться. Всегда проверяйте информацию и консультируйтесь с врачом
перед принятием решений о здоровье.
```

---

## GDPR Compliance

### 1. Privacy Policy

**Создать**: `apps/web/src/pages/privacy-policy-page.tsx`

**Основные разделы:**

#### 1.1 Какие данные мы собираем
```
- Персональные данные: имя, email, дата рождения
- Данные о здоровье: вес, рост, цели, активность
- Данные о питании: калории, макросы, приёмы пищи
- Технические данные: IP-адрес, browser info, device ID
- Платежные данные: обрабатываются через Stripe (мы не храним карты)
```

#### 1.2 Как мы используем данные
```
- Предоставление персонализированных рекомендаций
- Отслеживание прогресса
- Обработка подписок и платежей
- Отправка уведомлений (с вашего согласия)
- Улучшение сервиса и аналитика
```

#### 1.3 С кем мы делимся данными
```
- Stripe: обработка платежей
- SendGrid: отправка email
- Expo: push-уведомления
- Sentry: мониторинг ошибок (анонимизировано)
- Не продаём данные третьим лицам
```

#### 1.4 Ваши права (GDPR)
```
✅ Право на доступ: запросить копию ваших данных
✅ Право на исправление: обновить неверные данные
✅ Право на удаление: удалить аккаунт и все данные
✅ Право на ограничение обработки
✅ Право на переносимость данных (экспорт)
✅ Право отозвать согласие
✅ Право на возражение
```

#### 1.5 Как долго мы храним данные
```
- Активный аккаунт: до удаления пользователем
- После удаления: 30 дней (backup retention)
- Финансовые записи: 7 лет (требование законодательства)
- Логи: 90 дней
```

#### 1.6 Безопасность данных
```
- Шифрование при передаче (TLS/SSL)
- Шифрование в базе данных
- Регулярные backup
- Двухфакторная аутентификация (опционально)
- Ограниченный доступ сотрудников
```

### 2. Cookie Policy

**Создать**: `apps/web/src/components/cookie-banner.tsx`

```tsx
import { useState, useEffect } from 'react';

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true
    }));
    setShow(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false
    }));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="cookie-banner fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm">
            Мы используем cookies для улучшения работы сайта и персонализации контента.
            Продолжая использовать сайт, вы соглашаетесь с нашей{' '}
            <a href="/privacy" className="underline">Политикой конфиденциальности</a>.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={acceptNecessary}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            Только необходимые
          </button>
          <button
            onClick={acceptAll}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-semibold"
          >
            Принять все
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Типы cookies:**
- **Необходимые**: аутентификация, сессии (нельзя отключить)
- **Аналитические**: анонимная статистика использования
- **Маркетинговые**: персонализированная реклама (если используется)

### 3. Data Export Endpoint

**Создать**: `apps/backend/src/modules/users/users.controller.ts`

```typescript
import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { Res } from "@nestjs/common";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { UsersService } from "./users.service";
import { AuditService, AuditAction } from "../audit/audit.service";

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService
  ) {}

  @Get("me/export")
  @ApiOperation({ summary: "Экспорт всех данных пользователя (GDPR)" })
  async exportUserData(
    @CurrentUser() user: CurrentUserPayload,
    @Res() res: Response
  ) {
    // Audit log
    await this.auditService.log({
      userId: user.userId,
      action: AuditAction.DATA_EXPORTED
    });

    const userData = await this.usersService.exportUserData(user.userId);

    // Return as JSON file
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="vivaform-data-${user.userId}.json"`);
    res.send(JSON.stringify(userData, null, 2));
  }
}
```

**Service Implementation:**

```typescript
// apps/backend/src/modules/users/users.service.ts
async exportUserData(userId: string) {
  const [user, profile, nutrition, water, weight, recommendations, subscription] = await Promise.all([
    this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    }),
    this.prisma.profile.findUnique({ where: { userId } }),
    this.prisma.nutritionEntry.findMany({ where: { userId } }),
    this.prisma.waterEntry.findMany({ where: { userId } }),
    this.prisma.weightEntry.findMany({ where: { userId } }),
    this.prisma.recommendation.findMany({ where: { userId } }),
    this.prisma.subscription.findFirst({ where: { userId } })
  ]);

  return {
    exportDate: new Date().toISOString(),
    user,
    profile,
    nutrition,
    water,
    weight,
    recommendations,
    subscription: subscription ? {
      status: subscription.status,
      priceId: subscription.priceId,
      currentPeriodEnd: subscription.currentPeriodEnd,
      createdAt: subscription.createdAt
      // Exclude Stripe IDs for security
    } : null
  };
}
```

### 4. Account Deletion

**Добавить endpoint:**

```typescript
@Delete("me")
@ApiOperation({summary: "Удалить аккаунт (GDPR Right to be Forgotten)"})
deleteAccount(
    @CurrentUser()
user: CurrentUserPayload
)
{
    // Audit log before deletion
    await this.auditService.log({
        userId: user.userId,
        action: AuditAction.ACCOUNT_DELETED
    });

    await this.usersService.deleteAccount(user.userId);

    return {message: "Аккаунт успешно удалён"};
}
```

**Service Implementation:**

```typescript
async deleteAccount(userId: string) {
  // Cancel active subscriptions first
  const subscription = await this.prisma.subscription.findFirst({
    where: { userId, status: 'active' }
  });

  if (subscription) {
    // Cancel in Stripe
    await this.stripeService.client.subscriptions.cancel(
      subscription.stripeSubscription
    );
  }

  // Delete all user data (cascade)
  await this.prisma.user.delete({
    where: { id: userId }
  });
}
```

### 5. Consent Tracking

**Создать model:**

```prisma
// prisma/schema.prisma
model UserConsent {
  id                String   @id @default(cuid())
  userId            String
  marketingEmails   Boolean  @default(false)
  analyticsTracking Boolean  @default(false)
  dataProcessing    Boolean  @default(true)
  termsVersion      String   // e.g., "1.0"
  privacyVersion    String   // e.g., "1.0"
  consentDate       DateTime @default(now())
  ipAddress         String?
  userAgent         String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

**API для обновления:**

```typescript
@Patch("me/consent")
@ApiOperation({summary: "Обновить согласия пользователя"})
updateConsent(
    @CurrentUser()
user: CurrentUserPayload,
@Body()
dto: UpdateConsentDto,
@Req()
request: Request
)
{
    await this.prisma.userConsent.upsert({
        where: {userId: user.userId},
        create: {
            userId: user.userId,
            marketingEmails: dto.marketingEmails,
            analyticsTracking: dto.analyticsTracking,
            termsVersion: "1.0",
            privacyVersion: "1.0",
            ipAddress: request.ip,
            userAgent: request.headers['user-agent']
        },
        update: {
            marketingEmails: dto.marketingEmails,
            analyticsTracking: dto.analyticsTracking,
            consentDate: new Date()
        }
    });

    return {message: "Согласия обновлены"};
}
```

### 6. Terms of Service

**Основные пункты:**

#### 6.1 Использование сервиса
```
- Возраст: 16+ лет
- Создание только одного аккаунта
- Запрет на автоматизированный сбор данных (scraping)
- Запрет на злоупотребления и спам
```

#### 6.2 Подписки
```
- Описание планов (FREE, PREMIUM)
- Стоимость и периоды оплаты
- Политика возврата средств (14 дней)
- Автоматическое продление
- Отмена подписки
```

#### 6.3 Интеллектуальная собственность
```
- Контент принадлежит VivaForm
- Пользовательский контент: вы сохраняете права, но даёте нам лицензию
- Товарные знаки
```

#### 6.4 Ответственность
```
- Сервис предоставляется "как есть"
- Не гарантируем медицинские результаты
- Ограничение ответственности
- Возмещение убытков
```

#### 6.5 Изменения условий
```
- Уведомление за 30 дней
- Продолжение использования = согласие
```

---

## Implementation Checklist

### Backend
- [ ] Создать миграцию для `UserConsent` model
- [ ] Добавить `GET /users/me/export` endpoint
- [ ] Добавить `DELETE /users/me` endpoint
- [ ] Добавить `PATCH /users/me/consent` endpoint
- [ ] Обновить `UsersModule` с `AuditModule` dependency
- [ ] Добавить GDPR audit actions в `AuditService`

### Frontend (Web)
- [ ] Создать `privacy-policy-page.tsx`
- [ ] Создать `terms-of-service-page.tsx`
- [ ] Создать `cookie-policy-page.tsx`
- [ ] Добавить `CookieBanner` компонент
- [ ] Добавить `MedicalDisclaimer` компонент
- [ ] Добавить "Экспорт данных" в Settings
- [ ] Добавить "Удалить аккаунт" в Settings
- [ ] Добавить consent checkboxes при регистрации
- [ ] Добавить footer с ссылками на Privacy, Terms, Cookie Policy

### Mobile (React Native)
- [ ] Добавить медицинский дисклеймер на главный экран
- [ ] Добавить "Экспорт данных" в настройки
- [ ] Добавить "Удалить аккаунт" в настройки
- [ ] WebView для Privacy Policy и Terms

### Legal
- [ ] Подготовить Privacy Policy текст (с юристом)
- [ ] Подготовить Terms of Service текст (с юристом)
- [ ] Подготовить Cookie Policy текст
- [ ] Назначить Data Protection Officer (если требуется)
- [ ] Зарегистрироваться в EU-US Data Privacy Framework (если нужно)

### Documentation
- [ ] Добавить GDPR procedures в runbook
- [ ] Документировать процесс обработки data subject requests
- [ ] Создать инструкцию для саппорта по GDPR запросам
- [ ] Подготовить email templates для GDPR коммуникации

---

## Data Breach Protocol

В случае утечки данных:

1. **Немедленно (0-24 часа)**:
   - Изолировать скомпрометированную систему
   - Собрать информацию: что, когда, сколько пользователей
   - Уведомить команду безопасности

2. **В течение 72 часов**:
   - Уведомить надзорный орган (GDPR requirement)
   - Подготовить отчёт об инциденте

3. **Уведомление пользователей**:
   - Если высокий риск для прав и свобод
   - Описать инцидент, последствия, меры
   - Контакты для вопросов

4. **После инцидента**:
   - Root cause analysis
   - Исправление уязвимостей
   - Обновление процедур безопасности

---

## Contact Information

**Data Protection:**
- Email: privacy@vivaform.app
- Адрес: [Юридический адрес компании]

**Support:**
- Email: support@vivaform.app
- Telegram: @vivaform_support

**GDPR Requests:**
Отправить запрос на privacy@vivaform.app с темой:
- "GDPR Access Request" - запрос копии данных
- "GDPR Deletion Request" - удаление аккаунта
- "GDPR Correction Request" - исправление данных

Ответ в течение 30 дней.

---

**Last Updated**: 2025-11-04
**Status**: GDPR compliance framework готов, требуется юридическая проверка
