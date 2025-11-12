#!/usr/bin/env bash
file="apps/backend/.env.example"

if [ -f "$file" ]; then
    sed -i 's/vivaform_user:qwdqwd693/user:password/g' "$file" 2>/dev/null || true
    sed -i 's/vivaformtest/dbname/g' "$file" 2>/dev/null || true
    sed -i 's/JWT_SECRET=5129712a901642a0aa368466d361a924/JWT_SECRET=your-jwt-secret-here-min-32-chars/g' "$file" 2>/dev/null || true
    sed -i 's/JWT_REFRESH_SECRET=a6b3e5869cf64846a25af182963fe611/JWT_REFRESH_SECRET=your-refresh-secret-here-min-32-chars/g' "$file" 2>/dev/null || true
    sed -i 's|STRIPE_API_KEY=sk_test_[A-Za-z0-9]*|STRIPE_API_KEY=sk_test_your_stripe_test_key_here|g' "$file" 2>/dev/null || true
    sed -i 's|STRIPE_WEBHOOK_SECRET=whsec_[A-Za-z0-9]*|STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here|g' "$file" 2>/dev/null || true
    sed -i 's/STRIPE_PRICE_MONTHLY=price_[A-Za-z0-9]*/STRIPE_PRICE_MONTHLY=price_your_monthly_price_id/g' "$file" 2>/dev/null || true
    sed -i 's/STRIPE_PRICE_QUARTERLY=price_[A-Za-z0-9]*/STRIPE_PRICE_QUARTERLY=price_your_quarterly_price_id/g' "$file" 2>/dev/null || true
    sed -i 's/STRIPE_PRICE_ANNUAL=price_[A-Za-z0-9]*/STRIPE_PRICE_ANNUAL=price_your_annual_price_id/g' "$file" 2>/dev/null || true
    sed -i 's/SENDGRID_API_KEY=[A-Za-z0-9]*/SENDGRID_API_KEY=your_sendgrid_api_key_here/g' "$file" 2>/dev/null || true
    sed -i 's/SMTP_USER=[A-Za-z0-9]*/SMTP_USER=your_smtp_user/g' "$file" 2>/dev/null || true
    sed -i 's/SMTP_PASSWORD=[A-Za-z0-9]*/SMTP_PASSWORD=your_smtp_password/g' "$file" 2>/dev/null || true
    git add "$file" 2>/dev/null || true
fi

