import { ValidationPipe, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { raw } from "body-parser";
import helmet from "helmet";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
const cookieParser = require('cookie-parser');
import * as Sentry from '@sentry/node';
import { PrismaService } from './common/prisma/prisma.service';
import * as argon2 from 'argon2';

import { AppModule } from "./app.module";
import { validateEnvironment } from "./config/env.validator";
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';
import { CsrfCheckMiddleware } from './common/middleware/csrf-check.middleware';

// Validate environment variables before initializing anything
validateEnvironment();

const initSentryBackend = () => {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  // Безопасно подключаем профайлинг только если бинарник доступен
  let integrations: any[] = [];
  try {
    if (process.env.SENTRY_PROFILING === '1') {
      const mod = require('@sentry/profiling-node');
      if (mod?.nodeProfilingIntegration) {
        integrations.push(mod.nodeProfilingIntegration());
      }
    }
  } catch (e) {
    console.warn('[sentry] profiling disabled:', (e as Error)?.message);
  }
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    integrations,
    tracesSampleRate: 0.2,
    release: process.env.GIT_COMMIT || process.env.VERCEL_GIT_COMMIT_SHA || undefined
  });
};

function assertEmailConfigOrFail(config: ConfigService, logger: Logger) {
  const nodeEnv = config.get<string>('NODE_ENV') || process.env.NODE_ENV || 'development';
  const emailService = config.get<string>('EMAIL_SERVICE') || 'smtp';

  if (nodeEnv === 'production') {
    if (emailService === 'sendgrid') {
      const apiKey = config.get<string>('SENDGRID_API_KEY');
      if (!apiKey) {
        logger.error('SENDGRID_API_KEY is required in production when EMAIL_SERVICE=sendgrid');
        throw new Error('Email provider not configured');
      }
    } else {
      const smtpUser = config.get<string>('SMTP_USER');
      const smtpPass = config.get<string>('SMTP_PASSWORD');
      if (!smtpUser || !smtpPass) {
        logger.error('SMTP_USER/SMTP_PASSWORD are required in production when EMAIL_SERVICE=smtp');
        throw new Error('Email provider not configured');
      }
    }
  }
}

async function _seedAdminUser(app: any) {
  try {
    if (process.env.ADMIN_SEED_ENABLE !== '1') return; // выключено по умолчанию
    const email = process.env.ADMIN_SEED_EMAIL?.trim();
    const password = process.env.ADMIN_SEED_PASSWORD;
    if (!email || !password) {
      const logger = new Logger('AdminSeed');
      logger.warn('ADMIN_SEED_ENABLE=1, но ADMIN_SEED_EMAIL или ADMIN_SEED_PASSWORD не заданы');
      return;
    }
    const prisma: PrismaService = app.get(PrismaService);
    const existing = await prisma.user.findUnique({ where: { email } });
    const logger = new Logger('AdminSeed');
    if (existing) {
      if (existing.role !== 'ADMIN') {
        await prisma.user.update({ where: { id: existing.id }, data: { role: 'ADMIN' } });
        logger.log(`Существующий пользователь ${maskEmail(email)} повышен до ADMIN`);
      } else {
        logger.log(`Администратор ${maskEmail(email)} уже существует — пропускаем сид`);
      }
      return;
    }
    const passwordHash = await argon2.hash(password);
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'ADMIN',
        name: process.env.ADMIN_SEED_NAME || 'Admin',
        emailVerified: true
      }
    });
    logger.log(`Создан аккаунт администратора email=${maskEmail(email)}`);
  } catch (e) {
    const logger = new Logger('AdminSeed');
    logger.error(`Не удалось выполнить сид админа: ${(e as Error)?.message}`);
  }
}

function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return '***';
  const maskedUser = user.length <= 2 ? user[0] + '*' : user[0] + '*'.repeat(Math.min(user.length - 2, 6)) + user[user.length - 1];
  const parts = domain.split('.');
  const maskedDomain = parts[0].slice(0,1) + '***' + (parts[0].slice(-1) || '') + (parts.length>1?'.'+parts.slice(1).join('.'):'');
  return `${maskedUser}@${maskedDomain}`;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Fail-fast email config in production
  assertEmailConfigOrFail(configService, logger);

  const corsOrigins = configService.get<string[]>("app.corsOrigins", ["http://localhost:5173", "http://localhost:5174"]);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','Accept','X-Requested-With'],
    credentials: true,
    maxAge: 86400
  });

  app.use("/webhooks/stripe", raw({ type: "application/json" }));

  // request id for tracing
  app.use(requestIdMiddleware);

  app.use(cookieParser());

  // CSRF protection для state-changing запросов
  const csrfCheck = new CsrfCheckMiddleware();
  app.use((req: any, res: any, next: any) => csrfCheck.use(req, res, next));

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"].concat(corsOrigins).concat(['https://www.googletagmanager.com','https://www.google-analytics.com']),
          frameAncestors: ["'self'"]
        }
      },
      crossOriginEmbedderPolicy: false
    })
  );

  // Дополнительные заголовки безопасности
  app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
  app.use(helmet.hsts({ maxAge: 15552000 })); // 180 дней

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true }
    })
  );

  // global error filter and metrics interceptor
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new MetricsInterceptor());

  const enableSwaggerSetting = configService.get<boolean>("app.enableSwagger");
  const enableSwagger =
    typeof enableSwaggerSetting === "boolean"
      ? enableSwaggerSetting
      : process.env.NODE_ENV !== "production";

  if (enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("VivaForm API")
      .setDescription("REST API VivaForm для питания и здоровья")
      .setVersion("0.1.0")
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("/docs", app, document);
  }

  const port = configService.get<number>("app.port", 4000);
  await app.listen(port);
  logger.log(`🚀 Backend started on port ${port} (CORS: ${corsOrigins.join(', ')})`);
}

initSentryBackend();
bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
