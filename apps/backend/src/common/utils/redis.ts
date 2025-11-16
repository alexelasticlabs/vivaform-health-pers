import Redis from 'ioredis';

let client: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (client !== undefined) return client;
  const url = process.env.REDIS_URL;
  if (!url) {
    client = null;
    return client;
  }
  try {
    const r = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 2 });
    r.connect().catch(() => {});
    client = r;
  } catch {
    client = null;
  }
  return client;
}

export async function deleteByPattern(pattern: string): Promise<number> {
  const r = getRedis();
  if (!r) return 0;
  try {
    const keys = await r.keys(pattern);
    if (!keys.length) return 0;
    return await r.del(keys);
  } catch {
    return 0;
  }
}
