/**
 * Simple in-memory cache utility with TTL
 * 
 * For production with multiple server instances, consider using Redis:
 * - npm install redis
 * - Replace this implementation with Redis client
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.cache = new Map();
    this.cleanupInterval = null;
    this.startCleanupTask();
  }

  /**
   * Set a value in cache with TTL in milliseconds
   */
  set<T>(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
    });
    
    console.log(`[Cache] SET key="${key}" ttl=${ttl}ms`);
  }

  /**
   * Get a value from cache if it exists and is not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      console.log(`[Cache] MISS key="${key}"`);
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      console.log(`[Cache] EXPIRED key="${key}" age=${age}ms ttl=${entry.ttl}ms`);
      this.cache.delete(key);
      return null;
    }

    console.log(`[Cache] HIT key="${key}" age=${age}ms`);
    return entry.data as T;
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): void {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`[Cache] DELETE key="${key}"`);
    }
  }

  /**
   * Invalidate all keys matching a pattern
   */
  invalidatePattern(pattern: string): void {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    console.log(`[Cache] INVALIDATE pattern="${pattern}" count=${count}`);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`[Cache] CLEAR all entries count=${size}`);
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanupTask(): void {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60 * 1000);
  }

  /**
   * Remove all expired entries from cache
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`[Cache] CLEANUP removed ${removed} expired entries`);
    }
  }

  /**
   * Stop cleanup task (useful for graceful shutdown)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
    console.log('[Cache] Destroyed');
  }
}

// Singleton instance
const cache = new MemoryCache();

// Export cache instance
export default cache;

// Export type for external use
export type { CacheEntry };

/**
 * Generate cache key from filters
 */
export function generateCacheKey(prefix: string, filters: Record<string, any>): string {
  // Sort keys for consistent cache keys
  const sortedFilters = Object.keys(filters)
    .sort()
    .reduce((acc, key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        acc[key] = filters[key];
      }
      return acc;
    }, {} as Record<string, any>);

  const filtersString = JSON.stringify(sortedFilters);
  return `${prefix}:${filtersString}`;
}

/**
 * Example Redis integration (commented out):
 * 
 * import { createClient } from 'redis';
 * 
 * const redisClient = createClient({
 *   url: process.env.REDIS_URL || 'redis://localhost:6379'
 * });
 * 
 * redisClient.on('error', (err) => console.error('[Redis] Error', err));
 * await redisClient.connect();
 * 
 * // Set with TTL
 * await redisClient.setEx(key, ttlInSeconds, JSON.stringify(value));
 * 
 * // Get
 * const cached = await redisClient.get(key);
 * const value = cached ? JSON.parse(cached) : null;
 * 
 * // Delete
 * await redisClient.del(key);
 * 
 * // Pattern delete
 * const keys = await redisClient.keys(`${pattern}*`);
 * if (keys.length > 0) {
 *   await redisClient.del(keys);
 * }
 */
