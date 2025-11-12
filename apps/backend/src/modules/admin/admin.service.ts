import { Injectable } from "@nestjs/common";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../common/prisma/prisma.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { StripeService } from "../stripe/stripe.service";
import { getRedis } from '../../common/utils/redis';

export interface UserStats {
  totalUsers: number;
  freeUsers: number;
  premiumUsers: number;
  activeToday: number;
  newThisWeek: number;
}

export interface SystemStats {
  nutritionEntries: number;
  waterEntries: number;
  weightEntries: number;
  recommendations: number;
  foodItems: number;
  mealTemplates: number;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService, private readonly stripe: StripeService) {}
  private redis = getRedis();
  private readonly TTL_OVERVIEW = 60; // 1 минута для overview
  private readonly TTL_TREND = 300; // 5 минут для тренда
  private readonly TTL_HEATMAP = 120; // 2 минуты для heatmap
  private readonly TTL_SUBS_DIST = 120; // 2 минуты для распределения подписок

  private async getCached<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    try { const raw = await this.redis.get(key); return raw ? JSON.parse(raw) as T : null; } catch { return null; }
  }
  private async setCached(key: string, value: any, ttl: number) {
    if (!this.redis) return; try { await this.redis.set(key, JSON.stringify(value), 'EX', ttl); } catch {}
  }
  async invalidateAdminCache(pattern: string) {
    if (!this.redis) return;
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length) await this.redis.del(keys);
    } catch {}
  }

  // === Overview ===
  async getOverviewKpis(_from?: string, _to?: string) {
    const cacheKey = 'admin:overview';
    const cached = await this.getCached<any>(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7*24*60*60*1000);
    const monthAgo = new Date(now.getTime() - 30*24*60*60*1000);

    const [totalUsers, activeSubs, premiumUsers, dau] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } as any }),
      this.prisma.user.count({ where: { tier: 'PREMIUM' } as any }),
      this.prisma.user.count({
        where: {
          OR: [
            { nutrition: { some: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } } },
            { water: { some: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } } },
            { weight: { some: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } } }
          ]
        }
      })
    ]);

    const usersAddedLast7d = await this.prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } });
    const deltaUsers7d = usersAddedLast7d;

    // Реальный MRR: суммируем нормализованные (к месяцу) стоимости активных подписок по их priceId
    const subs = await this.prisma.subscription.findMany({ where: { status: 'ACTIVE' as any } });
    const uniquePriceIds = Array.from(new Set(subs.map(s => s.stripePriceId))).filter(Boolean) as string[];
    const priceMap = new Map<string, { monthlyAmount: number; currency: string }>();
    await Promise.all(uniquePriceIds.map(async (id) => {
      try { priceMap.set(id, await this.stripe.getMonthlyAmountForPrice(id)); } catch { priceMap.set(id, { monthlyAmount: 0, currency: 'USD' }); }
    }));
    const mrr = subs.reduce((sum, s) => sum + (priceMap.get(s.stripePriceId)?.monthlyAmount ?? 0), 0);

    // MRR месяц назад (подписки, активные на ту дату)
    const subsMonthAgo = await this.prisma.subscription.findMany({ where: { status: 'ACTIVE' as any, currentPeriodStart: { lte: monthAgo }, currentPeriodEnd: { gte: monthAgo } } });
    const mrrMonthAgo = subsMonthAgo.reduce((sum, s) => sum + (priceMap.get(s.stripePriceId)?.monthlyAmount ?? 0), 0);
    const mrrDeltaMoM = mrrMonthAgo ? (mrr - mrrMonthAgo) / mrrMonthAgo : 0;
    const mrrForecast = mrr * 1.05;

    // Онлайновая активность: пользователи с событиями за последние 5 минут
    const fiveMinAgo = new Date(Date.now() - 5*60*1000);
    const onlineNow = await this.prisma.user.count({
      where: {
        OR: [
          { nutrition: { some: { createdAt: { gte: fiveMinAgo } } } },
          { water: { some: { createdAt: { gte: fiveMinAgo } } } },
          { weight: { some: { createdAt: { gte: fiveMinAgo } } } }
        ]
      }
    });

    const result = {
      totalUsers,
      deltaUsers7d,
      activeSubs,
      premiumRatio: totalUsers ? premiumUsers / totalUsers : 0,
      mrr,
      mrrDeltaMoM,
      mrrForecast,
      dau,
      onlineNow
    };
    await this.setCached(cacheKey, result, this.TTL_OVERVIEW);
    return result;
  }

  async getRevenueTrend(_from?: string, _to?: string) {
    const cacheKey = 'admin:revenue-trend';
    const cached = await this.getCached<any>(cacheKey);
    if (cached) return cached;

    const days = 30;
    const now = new Date();

    // Предзагрузка тарифов по известным priceId для снижения количества обращений в Stripe
    const allActive = await this.prisma.subscription.findMany({ where: { status: 'ACTIVE' as any } });
    const allPriceIds = Array.from(new Set(allActive.map(s => s.stripePriceId))).filter(Boolean) as string[];
    const priceMap = new Map<string, { monthlyAmount: number; currency: string }>();
    await Promise.all(allPriceIds.map(async (id) => {
      try { priceMap.set(id, await this.stripe.getMonthlyAmountForPrice(id)); } catch { priceMap.set(id, { monthlyAmount: 0, currency: 'USD' }); }
    }));

    const series: { date: string; revenue: number; ma7: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const active = await this.prisma.subscription.findMany({
        where: {
          status: 'ACTIVE' as any,
          currentPeriodStart: { lte: d },
          currentPeriodEnd: { gte: d }
        }
      });
      const revenue = active.reduce((s, sub) => s + (priceMap.get(sub.stripePriceId)?.monthlyAmount ?? 0), 0);
      series.push({ date: d.toISOString().slice(0,10), revenue, ma7: 0 });
    }
    for (let i = 0; i < series.length; i++) {
      const start = Math.max(0, i - 6);
      const window = series.slice(start, i + 1);
      const avg = Math.round(window.reduce((s, p) => s + p.revenue, 0) / window.length);
      series[i].ma7 = avg;
    }
    await this.setCached(cacheKey, series, this.TTL_TREND);
    return series;
  }

  async getNewUsers(_from?: string, _to?: string, compare = false) {
    const days = 30;
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const current: { date: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(startDate);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const count = await this.prisma.user.count({ where: { createdAt: { gte: dayStart, lt: dayEnd } } });
      current.push({ date: dayStart.toISOString().slice(0,10), count });
    }
    if (!compare) return { current };
    // Предыдущие 30 дней
    const prev: { date: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(startDate);
      dayStart.setDate(dayStart.getDate() - days - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const count = await this.prisma.user.count({ where: { createdAt: { gte: dayStart, lt: dayEnd } } });
      prev.push({ date: dayStart.toISOString().slice(0,10), count });
    }
    return { current, prev };
  }

  async getSubsDistribution() {
    const cacheKey = 'admin:subs-dist';
    const cached = await this.getCached<any>(cacheKey);
    if (cached) return cached;

    const [free, monthly, quarterly, annual] = await Promise.all([
      this.prisma.user.count({ where: { tier: 'FREE' } as any }),
      this.prisma.subscription.count({ where: { plan: 'MONTHLY', status: 'ACTIVE' } as any }),
      this.prisma.subscription.count({ where: { plan: 'QUARTERLY', status: 'ACTIVE' } as any }),
      this.prisma.subscription.count({ where: { plan: 'ANNUAL', status: 'ACTIVE' } as any })
    ]);
    const result = { free, monthly, quarterly, annual };
    await this.setCached(cacheKey, result, this.TTL_SUBS_DIST);
    return result;
  }

  async getActivityHeatmap(_from?: string, _to?: string) {
    const cacheKey = 'admin:heatmap';
    const cached = await this.getCached<any>(cacheKey);
    if (cached) return cached;

    // Агрегация количества записей по часам и дням недели (nutrition+water+weight)
    const start = _from ? new Date(_from) : new Date(Date.now() - 7*24*60*60*1000);
    const end = _to ? new Date(_to) : new Date();

    const nutrition = await this.prisma.nutritionEntry.findMany({ where: { createdAt: { gte: start, lte: end } }, select: { createdAt: true } });
    const water = await this.prisma.waterEntry.findMany({ where: { createdAt: { gte: start, lte: end } }, select: { createdAt: true } });
    const weight = await this.prisma.weightEntry.findMany({ where: { createdAt: { gte: start, lte: end } }, select: { createdAt: true } });
    const all = [...nutrition, ...water, ...weight];
    const map = new Map<string, number>();
    for (const r of all) {
      const d = r.createdAt;
      const weekday = d.getDay(); // 0-6
      const hour = d.getHours(); // 0-23
      const key = `${weekday}:${hour}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    const data: { weekday: number; hour: number; count: number }[] = [];
    for (let w = 0; w < 7; w++) {
      for (let h = 0; h < 24; h++) {
        data.push({ weekday: w, hour: h, count: map.get(`${w}:${h}`) ?? 0 });
      }
    }
    await this.setCached(cacheKey, data, this.TTL_HEATMAP);
    return data;
  }

  async getSystemHealthOverview() {
    const started = Date.now();
    const dbOk = await this.prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
    const dbLatency = Date.now() - started;
    // Stripe status: проверяем наличие хотя бы одной активной подписки как признак работы Stripe-интеграции
    const stripeActive = await this.prisma.subscription.count({ where: { status: 'ACTIVE' as any } }).then(c => c >= 0).catch(() => false);

    return {
      api: { avg: 0, p95: 0 }, // Для полноценного мониторинга нужна метрика сборщика
      db: { status: dbOk ? 'ok' : 'error', latency: dbLatency },
      redis: { status: 'not_configured' },
      jobs: [],
      stripe: { status: stripeActive ? 'ok' : 'degraded', lastOk: stripeActive ? new Date().toISOString() : null }
    };
  }

  /**
   * Получить список всех пользователей
   */
  async getAllUsers(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tier: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              nutrition: true,
              water: true,
              weight: true,
              recommendations: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.user.count()
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getAllUsersFiltered(params: { q?: string; role?: string; tier?: string; regFrom?: string; regTo?: string; sortBy?: string; sortDir?: string; page?: number; limit?: number; }) {
    const { q, role, tier, regFrom, regTo, sortBy = 'createdAt', sortDir = 'desc', page = 1, limit = 50 } = params || {};
    const safeLimit = Math.min(Math.max(limit || 50, 1), 100);
    const skip = (page - 1) * safeLimit;

    const where: any = {};
    if (q) {
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { id: q }
      ];
    }
    if (role) where.role = role as any;
    if (tier) where.tier = tier as any;
    if (regFrom || regTo) where.createdAt = {
      ...(regFrom ? { gte: new Date(regFrom) } : {}),
      ...(regTo ? { lte: new Date(regTo) } : {})
    };

    const orderBy: any = { [sortBy as string]: (sortDir === 'asc' ? 'asc' : 'desc') };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy,
        select: {
          id: true, email: true, name: true, role: true, tier: true, createdAt: true, updatedAt: true,
          _count: { select: { nutrition: true, water: true, weight: true, recommendations: true } }
        }
      }),
      this.prisma.user.count({ where })
    ]);

    return { users, pagination: { page, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } };
  }

  async exportUsersCsv(params: { q?: string; role?: string; tier?: string; regFrom?: string; regTo?: string; sortBy?: string; sortDir?: string; }) {
    const result = await this.getAllUsersFiltered({ ...params, page: 1, limit: 1000 });
    const header = ['id','email','name','role','tier','createdAt'];
    const lines = [header.join(',')];
    for (const u of result.users) {
      lines.push([u.id, u.email, (u.name||''), u.role, u.tier, u.createdAt.toISOString()].map(v => `"${String(v).replaceAll('"','""')}"`).join(','));
    }
    return { filename: `users-${Date.now()}.csv`, mime: 'text/csv', body: lines.join('\n') };
  }

  /**
   * Получить статистику пользователей
   */
  async getUserStats(): Promise<UserStats> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalUsers, freeUsers, premiumUsers, newThisWeek] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { tier: "FREE" } }),
      this.prisma.user.count({ where: { tier: "PREMIUM" } }),
      this.prisma.user.count({ where: { createdAt: { gte: weekAgo } } })
    ]);

    // Приблизительное количество активных пользователей (добавили записи сегодня)
    const activeToday = await this.prisma.user.count({
      where: {
        OR: [
          { nutrition: { some: { createdAt: { gte: todayStart } } } },
          { water: { some: { createdAt: { gte: todayStart } } } },
          { weight: { some: { createdAt: { gte: todayStart } } } }
        ]
      }
    });

    return {
      totalUsers,
      freeUsers,
      premiumUsers,
      activeToday,
      newThisWeek
    };
  }

  /**
   * Получить системную статистику
   */
  async getSystemStats(): Promise<SystemStats> {
    const [nutritionEntries, waterEntries, weightEntries, recommendations, foodItems, mealTemplates] =
      await Promise.all([
        this.prisma.nutritionEntry.count(),
        this.prisma.waterEntry.count(),
        this.prisma.weightEntry.count(),
        this.prisma.recommendation.count(),
        this.prisma.foodItem.count(),
        this.prisma.mealTemplate.count()
      ]);

    return {
      nutritionEntries,
      waterEntries,
      weightEntries,
      recommendations,
      foodItems,
      mealTemplates
    };
  }

  /**
   * Изменить роль пользователя
   */
  async updateUserRole(userId: string, role: "USER" | "ADMIN") {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true
      }
    });
  }

  /**
   * Получить список продуктов для модерации
   */
  async getFoodItems(verified?: boolean, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const where = verified !== undefined ? { verified } : {};

    const [foods, total] = await Promise.all([
      this.prisma.foodItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.foodItem.count({ where })
    ]);

    return {
      foods,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Верифицировать продукт
   */
  async verifyFoodItem(foodId: string, verified: boolean) {
    return this.prisma.foodItem.update({
      where: { id: foodId },
      data: { verified }
    });
  }

  /**
   * Удалить продукт
   */
  async deleteFoodItem(foodId: string) {
    return this.prisma.foodItem.delete({
      where: { id: foodId }
    });
  }

  /**
   * Получить детали пользователя
   */
  async getUserDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, role: true, tier: true, createdAt: true,
        profile: true,
        subscription: true
      }
    });
    if (!user) return null;

    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30*24*60*60*1000);

    const [nutrition, water, weight] = await Promise.all([
      this.prisma.nutritionEntry.findMany({ where: { userId, date: { gte: monthAgo } }, orderBy: { date: 'desc' }, take: 50 }),
      this.prisma.waterEntry.findMany({ where: { userId, date: { gte: monthAgo } }, orderBy: { date: 'desc' }, take: 50 }),
      this.prisma.weightEntry.findMany({ where: { userId, date: { gte: monthAgo } }, orderBy: { date: 'desc' }, take: 50 })
    ]);

    const daysLogged = new Set(nutrition.map(n => n.date.toISOString().slice(0,10))).size;
    const avgCalories = Math.round(nutrition.reduce((s, n) => s + n.calories, 0) / Math.max(1, nutrition.length));
    const weightChange = (weight.at(0)?.weightKg ?? 0) - (weight.at(-1)?.weightKg ?? (weight.at(0)?.weightKg ?? 0));

    return {
      user,
      activity30d: { daysLogged, avgCalories, weightChange },
      last: { nutrition, water, weight }
    };
  }

  // === Support tickets ===
  async listTickets(params: { status?: string; priority?: string; assignee?: string; page?: number; limit?: number }) {
    const { status, priority, assignee, page = 1, limit = 25 } = params || {};
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (page - 1) * safeLimit;
    const where: any = {};
    if (status) where.status = status as any;
    if (priority) where.priority = priority as any;
    if (assignee) where.assignedTo = assignee;

    const [items, total] = await Promise.all([
      (this.prisma as any).supportTicket.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, email: true, name: true } } }
      }),
      (this.prisma as any).supportTicket.count({ where })
    ]);
    return { items, pagination: { page, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } };
  }

  async getTicket(id: string) {
    return (this.prisma as any).supportTicket.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, name: true } }, messages: { orderBy: { createdAt: 'asc' } } }
    });
  }

  async replyTicket(id: string, body: string, adminId?: string) {
    const ticket = await (this.prisma as any).supportTicket.findUnique({ where: { id } });
    if (!ticket) return null;
    const msg = await (this.prisma as any).supportMessage.create({
      data: { ticketId: id, authorType: 'ADMIN', authorId: adminId ?? null, body }
    });
    await (this.prisma as any).supportTicket.update({ where: { id }, data: { updatedAt: new Date() } });
    return msg;
  }

  async updateTicket(id: string, patch: { status?: string; priority?: string; assignedTo?: string }) {
    return (this.prisma as any).supportTicket.update({ where: { id }, data: { ...patch } as any });
  }

  // === Settings ===
  private settingsWhitelist = new Set([
    'app.name',
    'support.email',
    'notifications.email.enabled',
    'notifications.push.enabled',
    'analytics.metaPixelId',
    'analytics.googleAdsId'
  ]);

  async getSettings() {
    const rows = await (this.prisma as any).setting.findMany();
    const obj: Record<string, unknown> = {};
    for (const r of rows) obj[r.key] = r.value as unknown;
    return obj;
  }

  async patchSettings(patch: Record<string, unknown>, adminId?: string) {
    const entries = Object.entries(patch).filter(([k]) => this.settingsWhitelist.has(k));
    for (const [key, value] of entries) {
      await (this.prisma as any).setting.upsert({
        where: { key },
        update: { value: value as any, updatedBy: adminId ?? null },
        create: { key, value: value as any, updatedBy: adminId ?? null }
      });
    }
    return this.getSettings();
  }

  async listSubscriptions(params: { status?: string; plan?: string; page?: number; limit?: number }) {
    const { status, plan, page = 1, limit = 25 } = params || {};
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (page - 1) * safeLimit;
    const where: any = {};
    if (status) where.status = status as any;
    if (plan) where.plan = plan as any;
    const [items, total] = await Promise.all([
      this.prisma.subscription.findMany({ where, skip, take: safeLimit, orderBy: { updatedAt: 'desc' }, include: { user: { select: { id: true, email: true, name: true } } } }),
      this.prisma.subscription.count({ where })
    ]);
    return { items, pagination: { page, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } };
  }
}

