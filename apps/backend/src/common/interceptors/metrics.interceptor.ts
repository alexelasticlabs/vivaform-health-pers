import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

// Lazy import prom-client to avoid type coupling
const prom = require('prom-client');

const httpRequestDuration = new prom.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

const httpRequestCount = new prom.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = process.hrtime.bigint();
    const http = context.switchToHttp();
    const req: any = http.getRequest();
    const res: any = http.getResponse();

    const method = (req.method || 'GET').toUpperCase();
    // For Express, route path may be available after handler; fallback to originalUrl
    const route = req.route?.path || req.baseUrl || req.originalUrl || req.url || 'unknown';

    return next.handle().pipe(
      tap({
        next: () => record(),
        error: () => record()
      })
    );

    function record() {
      const diffNs = Number(process.hrtime.bigint() - now);
      const seconds = diffNs / 1e9; // convert to seconds
      const status = String(res.statusCode || 200);
      httpRequestDuration.labels(method, route, status).observe(seconds);
      httpRequestCount.labels(method, route, status).inc();
    }
  }
}

