# Email Service Setup Guide

## Выбор провайдера

### Рекомендуемые сервисы:

1. **SendGrid** (самый простой для начала)
   - Free tier: 100 emails/day
   - Простая интеграция
   - Отличная доставляемость

2. **AWS SES** (для production)
   - $0.10 за 1000 emails
   - Требует верификации домена
   - Лучший выбор для масштабирования

3. **Mailgun**
   - Free tier: 5000 emails/month
   - Простой API
   - Хорошая документация

---

## Вариант 1: SendGrid (Рекомендуется для начала)

### 1. Регистрация и получение API ключа

1. Зарегистрируйтесь на https://sendgrid.com/
2. Перейдите в Settings → API Keys
3. Создайте новый API Key с правами "Mail Send"
4. Сохраните ключ (он показывается только один раз!)

### 2. Установка зависимостей

```bash
cd apps/backend
pnpm add @sendgrid/mail
pnpm add -D @types/sendgrid__mail
```

### 3. Добавьте в `.env`

```env
# Email Configuration
EMAIL_SERVICE="sendgrid"
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="VivaForm Health"
```

### 4. Создайте Email Service

**Файл: `apps/backend/src/modules/email/email.service.ts`**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

export interface SendEmailDto {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('SENDGRID_API_KEY not configured - email sending disabled');
      return;
    }

    sgMail.setApiKey(apiKey);
    
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'noreply@example.com';
    this.fromName = this.configService.get<string>('EMAIL_FROM_NAME') || 'VivaForm';
    
    this.logger.log('SendGrid email service initialized');
  }

  async sendEmail(dto: SendEmailDto): Promise<void> {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('Email sending skipped - SENDGRID_API_KEY not configured');
      return;
    }

    try {
      await sgMail.send({
        to: dto.to,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: dto.subject,
        html: dto.html,
        text: dto.text || dto.html.replace(/<[^>]*>/g, '')
      });

      this.logger.log(`Email sent to ${dto.to}: ${dto.subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${dto.to}:`, error);
      throw error;
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verifyUrl = \`\${this.configService.get('FRONTEND_URL')}/verify-email?token=\${token}\`;

    await this.sendEmail({
      to: email,
      subject: 'Подтвердите ваш email - VivaForm',
      html: \`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 30px; 
              background: #10b981; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px;
              margin: 20px 0;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Добро пожаловать в VivaForm! 🥗</h2>
            <p>Спасибо за регистрацию! Чтобы начать пользоваться приложением, подтвердите ваш email адрес.</p>
            <a href="\${verifyUrl}" class="button">Подтвердить Email</a>
            <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
            <p style="word-break: break-all; color: #666;">\${verifyUrl}</p>
            <p>Ссылка действительна 24 часа.</p>
            <div class="footer">
              <p>Если вы не регистрировались на VivaForm, просто проигнорируйте это письмо.</p>
              <p>© 2025 VivaForm Health. Все права защищены.</p>
            </div>
          </div>
        </body>
        </html>
      \`
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = \`\${this.configService.get('FRONTEND_URL')}/reset-password?token=\${token}\`;

    await this.sendEmail({
      to: email,
      subject: 'Сброс пароля - VivaForm',
      html: \`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 30px; 
              background: #ef4444; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px;
              margin: 20px 0;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Сброс пароля</h2>
            <p>Вы запросили сброс пароля для вашего аккаунта VivaForm.</p>
            <a href="\${resetUrl}" class="button">Сбросить пароль</a>
            <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
            <p style="word-break: break-all; color: #666;">\${resetUrl}</p>
            <p>Ссылка действительна 1 час.</p>
            <div class="footer">
              <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
              <p>© 2025 VivaForm Health. Все права защищены.</p>
            </div>
          </div>
        </body>
        </html>
      \`
    });
  }

  async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Добро пожаловать в VivaForm! 🎉',
      html: \`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .feature { margin: 15px 0; }
            .button { 
              display: inline-block; 
              padding: 12px 30px; 
              background: #10b981; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🥗 Добро пожаловать в VivaForm!</h1>
              \${name ? \`<p>Привет, \${name}!</p>\` : ''}
            </div>
            <p>Рады видеть вас в нашем сообществе здорового питания!</p>
            <h3>Что вы можете делать в VivaForm:</h3>
            <div class="feature">✅ Персонализированные планы питания</div>
            <div class="feature">📊 Отслеживание калорий и макронутриентов</div>
            <div class="feature">💧 Трекинг потребления воды</div>
            <div class="feature">⚖️ Контроль веса</div>
            <div class="feature">🔔 Напоминания о здоровых привычках</div>
            <p style="text-align: center; margin: 30px 0;">
              <a href="\${this.configService.get('FRONTEND_URL')}/dashboard" class="button">
                Начать сейчас
              </a>
            </p>
            <p>Если у вас есть вопросы, мы всегда готовы помочь!</p>
            <p>С наилучшими пожеланиями,<br>Команда VivaForm</p>
          </div>
        </body>
        </html>
      \`
    });
  }

  async sendSubscriptionConfirmation(email: string, planName: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: \`Подписка \${planName} активирована! 💎\`,
      html: \`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .success { 
              background: #dcfce7; 
              border-left: 4px solid #10b981; 
              padding: 15px; 
              margin: 20px 0; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Спасибо за подписку! 🎉</h2>
            <div class="success">
              <strong>Ваша подписка \${planName} успешно активирована!</strong>
            </div>
            <p>Теперь вам доступны все premium функции:</p>
            <ul>
              <li>🤖 AI персонализация планов питания</li>
              <li>📱 Мобильное приложение без рекламы</li>
              <li>📊 Расширенная аналитика</li>
              <li>💬 Приоритетная поддержка</li>
            </ul>
            <p>Управляйте подпиской в личном кабинете.</p>
            <p>С уважением,<br>Команда VivaForm</p>
          </div>
        </body>
        </html>
      \`
    });
  }
}
```

### 5. Создайте Email Module

**Файл: `apps/backend/src/modules/email/email.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

@Module({
  providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule {}
```

### 6. Подключите в AppModule

**Файл: `apps/backend/src/app.module.ts`**

```typescript
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [
    // ... другие модули
    EmailModule,
  ],
  // ...
})
export class AppModule {}
```

### 7. Используйте в AuthService

**Обновите `apps/backend/src/modules/auth/auth.service.ts`:**

```typescript
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private emailService: EmailService,
    // ... другие зависимости
  ) {}

  async register(dto: RegisterDto) {
    // ... создание пользователя
    
    // Генерация verification token
    const verificationToken = await this.generateEmailToken(user.id);
    
    // Отправка email
    await this.emailService.sendVerificationEmail(user.email, verificationToken);
    
    return { user, tokens };
  }

  async verifyEmail(token: string) {
    // ... верификация токена
    await this.usersService.verifyEmail(userId);
    
    // Отправка welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.name);
    
    return { message: 'Email verified successfully' };
  }

  private async generateEmailToken(userId: string): Promise<string> {
    // Создаем JWT токен для верификации email
    return this.jwtService.sign(
      { userId, type: 'email-verification' },
      { secret: this.configService.get('JWT_SECRET'), expiresIn: '24h' }
    );
  }
}
```

### 8. Тестирование

```bash
# Запустите backend
cd apps/backend
pnpm dev

# Протестируйте регистрацию
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'

# Проверьте email в SendGrid Dashboard
```

---

## Вариант 2: AWS SES (Production)

### 1. Установка зависимостей

```bash
cd apps/backend
pnpm add @aws-sdk/client-ses
```

### 2. Добавьте в `.env`

```env
EMAIL_SERVICE="ses"
AWS_REGION="eu-central-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
EMAIL_FROM="noreply@yourdomain.com"
```

### 3. Email Service для SES

```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
  private readonly sesClient: SESClient;
  
  constructor(private configService: ConfigService) {
    if (this.configService.get('EMAIL_SERVICE') === 'ses') {
      this.sesClient = new SESClient({
        region: this.configService.get('AWS_REGION'),
        credentials: {
          accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID')!,
          secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY')!
        }
      });
    }
  }

  async sendEmail(dto: SendEmailDto): Promise<void> {
    const command = new SendEmailCommand({
      Source: this.fromEmail,
      Destination: { ToAddresses: [dto.to] },
      Message: {
        Subject: { Data: dto.subject },
        Body: {
          Html: { Data: dto.html },
          Text: { Data: dto.text || '' }
        }
      }
    });

    await this.sesClient.send(command);
  }
}
```

---

## Вариант 3: Nodemailer (для любого SMTP)

### 1. Установка

```bash
pnpm add nodemailer
pnpm add -D @types/nodemailer
```

### 2. `.env`

```env
EMAIL_SERVICE="smtp"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"
```

### 3. Service

```typescript
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS')
      }
    });
  }

  async sendEmail(dto: SendEmailDto): Promise<void> {
    await this.transporter.sendMail({
      from: this.fromEmail,
      to: dto.to,
      subject: dto.subject,
      html: dto.html,
      text: dto.text
    });
  }
}
```

---

## Domain Verification (для production)

### SendGrid
1. Settings → Sender Authentication
2. Authenticate Your Domain
3. Добавьте DNS записи (CNAME)

### AWS SES
1. Verify domain в SES Console
2. Добавьте DNS записи (TXT, CNAME, MX)
3. Включите DKIM signing

---

## Готовые шаблоны email

Создайте `apps/backend/src/modules/email/templates/` с HTML шаблонами для лучшей поддержки.

---

## Troubleshooting

### Emails попадают в спам
- Настройте SPF, DKIM, DMARC
- Верифицируйте домен
- Избегайте спам-слов в теме

### Ошибки отправки
```typescript
// Добавьте retry logic
async sendEmailWithRetry(dto: SendEmailDto, retries = 3): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await this.sendEmail(dto);
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

---

**Рекомендация:** Начните с SendGrid для разработки, затем переключитесь на AWS SES для production.
