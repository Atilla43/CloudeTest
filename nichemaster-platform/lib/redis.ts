import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://:nichemaster_redis_password@localhost:6379';

export const redis = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        return new Error('Redis connection failed after 10 retries');
      }
      return retries * 100;
    },
  },
});

redis.on('error', (err) => console.error('Redis Client Error:', err));
redis.on('connect', () => console.log('Redis Client Connected'));

// Connect to Redis
if (!redis.isOpen) {
  redis.connect().catch(console.error);
}

// Helper functions for caching
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    try {
      await redis.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  },

  async del(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  },

  async clear(pattern: string = '*'): Promise<boolean> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
      return true;
    } catch (error) {
      console.error(`Cache clear error for pattern ${pattern}:`, error);
      return false;
    }
  },
};

export default redis;
