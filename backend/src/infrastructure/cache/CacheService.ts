interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

export class CacheService {
  private static instance: CacheService;
  private cache = new Map<string, CacheItem<any>>();

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  public set<T>(key: string, value: T, ttlSeconds: number = 30): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  public del(key: string): void {
    this.cache.delete(key);
  }

  public flushPattern(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  public clear(): void {
    this.cache.clear();
  }
}
