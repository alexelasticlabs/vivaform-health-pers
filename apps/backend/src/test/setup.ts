import 'reflect-metadata';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret';
process.env.STRIPE_API_KEY = process.env.STRIPE_API_KEY || 'test-stripe-key';
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'test-stripe-webhook';

