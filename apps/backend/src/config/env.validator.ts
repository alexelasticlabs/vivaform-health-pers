import { Logger } from '@nestjs/common';

const logger = new Logger('EnvValidator');

interface RequiredEnvVars {
  [key: string]: {
    value: string | undefined;
    validate?: (value: string) => boolean;
    errorMessage?: string;
  };
}

/**
 * Validates required environment variables on application startup
 * Throws error if validation fails in production mode
 */
export function validateEnvironment(): void {
  const isProd = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  // Skip validation in test environment
  if (isTest) {
    logger.log('Skipping env validation in test environment');
    return;
  }

  const required: RequiredEnvVars = {
    DATABASE_URL: {
      value: process.env.DATABASE_URL,
      validate: (val) => val.startsWith('postgresql://'),
      errorMessage: 'DATABASE_URL must be a valid PostgreSQL connection string',
    },
    JWT_SECRET: {
      value: process.env.JWT_SECRET,
      validate: (val) => val.length >= 32,
      errorMessage: 'JWT_SECRET must be at least 32 characters long',
    },
    JWT_REFRESH_SECRET: {
      value: process.env.JWT_REFRESH_SECRET,
      validate: (val) => val.length >= 32,
      errorMessage: 'JWT_REFRESH_SECRET must be at least 32 characters long',
    },
  };

  // Production-only required variables
  if (isProd) {
    Object.assign(required, {
      STRIPE_API_KEY: {
        value: process.env.STRIPE_API_KEY,
        validate: (val: string) => val.startsWith('sk_live_') || val.startsWith('sk_test_'),
        errorMessage: 'STRIPE_API_KEY must be a valid Stripe key',
      },
      STRIPE_WEBHOOK_SECRET: {
        value: process.env.STRIPE_WEBHOOK_SECRET,
        validate: (val: string) => val.startsWith('whsec_'),
        errorMessage: 'STRIPE_WEBHOOK_SECRET must be a valid Stripe webhook secret',
      },
      SENTRY_DSN: {
        value: process.env.SENTRY_DSN,
        validate: (val: string) => val.startsWith('https://'),
        errorMessage: 'SENTRY_DSN must be a valid Sentry DSN URL',
      },
      EMAIL_SERVICE: {
        value: process.env.EMAIL_SERVICE,
        validate: (val: string) => ['sendgrid', 'smtp'].includes(val),
        errorMessage: 'EMAIL_SERVICE must be either "sendgrid" or "smtp"',
      },
    });

    // Email service-specific validation
    if (process.env.EMAIL_SERVICE === 'sendgrid') {
      required.SENDGRID_API_KEY = {
        value: process.env.SENDGRID_API_KEY,
        errorMessage: 'SENDGRID_API_KEY is required when EMAIL_SERVICE=sendgrid',
      };
    } else {
      required.SMTP_USER = {
        value: process.env.SMTP_USER,
        errorMessage: 'SMTP_USER is required when EMAIL_SERVICE=smtp',
      };
      required.SMTP_PASSWORD = {
        value: process.env.SMTP_PASSWORD,
        errorMessage: 'SMTP_PASSWORD is required when EMAIL_SERVICE=smtp',
      };
    }
  }

  const errors: string[] = [];

  // Check for missing variables
  for (const [key, config] of Object.entries(required)) {
    if (!config.value) {
      errors.push(`❌ ${key} is not set`);
      continue;
    }

    // Validate value if validator function provided
    if (config.validate && !config.validate(config.value)) {
      errors.push(`❌ ${key}: ${config.errorMessage || 'Invalid value'}`);
    }
  }

  if (errors.length > 0) {
    logger.error('Environment validation failed:');
    errors.forEach((error) => logger.error(error));

    if (isProd) {
      throw new Error(
        `Environment validation failed in production. Missing or invalid variables:\n${errors.join('\n')}`
      );
    } else {
      logger.warn('⚠️  Running in development with missing/invalid environment variables');
    }
  } else {
    logger.log('✅ Environment validation passed');
  }

  // Warnings for recommended but not required variables
  const warnings: string[] = [];

  if (!process.env.CORS_ORIGINS) {
    warnings.push('CORS_ORIGINS not set, using defaults');
  }

  if (!process.env.PORT) {
    warnings.push('PORT not set, using default 4000');
  }

  if (warnings.length > 0) {
    warnings.forEach((warning) => logger.warn(`⚠️  ${warning}`));
  }
}

