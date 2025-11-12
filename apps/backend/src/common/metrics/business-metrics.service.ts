import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import type { PrismaService } from '../prisma/prisma.service';
import type { StripeService } from '../../modules/stripe/stripe.service';

// prom-client уже загружен через metrics interceptor; подхватываем общую registry
const prom = require('prom-client');

const gaugeMrr = new prom.Gauge({ name: 'vivaform_mrr_monthly', help: 'Current normalized monthly recurring revenue', labelNames: ['currency'] });
const gaugeActiveSubs = new prom.Gauge({ name: 'vivaform_active_subscriptions', help: 'Number of active subscriptions' });
const gaugeTotalUsers = new prom.Gauge({ name: 'vivaform_total_users', help: 'Total registered users' });
const gaugePremiumRatio = new prom.Gauge({ name: 'vivaform_premium_ratio', help: 'Ratio of premium users to total users' });

@Injectable()
export class BusinessMetricsService {
  private readonly logger = new Logger(BusinessMetricsService.name);
  private updating = false;

  constructor(private readonly prisma: PrismaService, private readonly stripe: StripeService) {}

  @Interval(60_000)
  async scheduledUpdate() {
    await this.updateNow();
  }

  async updateNow() {
    if (this.updating) return; // skip overlapping
    this.updating = true;
    try {
      const [totalUsers, premiumUsers, activeSubs] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { tier: 'PREMIUM' as any } }),
        this.prisma.subscription.count({ where: { status: 'ACTIVE' as any } })
      ]);

      gaugeTotalUsers.set(totalUsers);
      gaugePremiumRatio.set(totalUsers ? premiumUsers / totalUsers : 0);
      gaugeActiveSubs.set(activeSubs);

      // MRR calculation using cached price normalization
      const subs = await this.prisma.subscription.findMany({ where: { status: 'ACTIVE' as any } });
      const uniquePriceIds = Array.from(new Set(subs.map(s => s.stripePriceId))).filter(Boolean);
      const priceMap = new Map<string, { monthlyAmount: number; currency: string }>();
      await Promise.all(uniquePriceIds.map(async id => {
        try { priceMap.set(id, await this.stripe.getMonthlyAmountForPrice(id)); } catch { priceMap.set(id, { monthlyAmount: 0, currency: 'USD' }); }
      }));
      // Assume single currency for simplicity; take first non-empty or USD
      const currency = priceMap.values().next().value?.currency || 'USD';
      const mrr = subs.reduce((sum, s) => sum + (priceMap.get(s.stripePriceId)?.monthlyAmount ?? 0), 0);
      gaugeMrr.labels(currency).set(mrr);
    } catch (e: any) {
      this.logger.warn(`Failed to update business metrics: ${e.message}`);
    } finally {
      this.updating = false;
    }
  }
}
