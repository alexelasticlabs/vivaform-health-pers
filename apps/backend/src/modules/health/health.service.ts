import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus() {
    const startTime = Date.now();
    
    // Check database connectivity
    let dbStatus = 'ok';
    let dbLatency = 0;
    try {
      const dbStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - dbStart;
    } catch (error) {
      dbStatus = 'error';
    }

    // System info
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      version: process.env.npm_package_version || '0.1.0',
      database: {
        status: dbStatus,
        latencyMs: dbLatency
      },
      memory: {
        heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        rssMB: Math.round(memoryUsage.rss / 1024 / 1024)
      },
      node: {
        version: process.version,
        env: process.env.NODE_ENV || 'development'
      }
    };
  }

  async getMetrics() {
    const [activeUsers24h, activeSubscriptions] = await Promise.all([
      this.prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      this.prisma.subscription.count({
        where: { status: 'active' }
      })
    ]);

    return {
      active_users_24h: activeUsers24h,
      subscriptions_active: activeSubscriptions,
      timestamp: new Date().toISOString()
    };
  }
}