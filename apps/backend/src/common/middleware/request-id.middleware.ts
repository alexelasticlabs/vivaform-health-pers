import { v4 as uuid } from 'uuid';
import type { NextFunction, Request, Response } from 'express';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const id = req.headers['x-request-id'] || uuid();
  (req as any).requestId = id;
  res.setHeader('X-Request-Id', String(id));
  next();
}

