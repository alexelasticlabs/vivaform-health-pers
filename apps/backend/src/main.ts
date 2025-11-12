import { ValidationPipe, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { raw } from "body-parser";
import helmet from "helmet";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
const cookieParser = require('cookie-parser');
import * as Sentry from '@sentry/node';

import { AppModule } from "./app.module";
import { validateEnvironment } from "./config/env.validator";
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';

// Validate environment variables before initializing anything
validateEnvironment();

const initSentryBackend = () => {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  // Безопасно подключаем профайлинг только если бинарник доступен
  let integrations: any[] = [];
  try {
    if (process.env.SENTRY_PROFILING === '1') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('@sentry/profiling-node');
      if (mod?.nodeProfilingIntegration) {
        integrations.push(mod.nodeProfilingIntegration());
      }
    }
  } catch (e) {
    // На Windows бинарник может отсутствовать — тихо пропускаем профайлинг
    // eslint-disable-next-line no-console
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

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"].concat(corsOrigins).concat(['https://www.googletagmanager.com','https://www.google-analytics.com'])
        }
      },
      crossOriginEmbedderPolicy: false
    })
  );

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

  app.use(cookieParser());

  if (configService.get<boolean>("app.enableSwagger", true)) {
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
