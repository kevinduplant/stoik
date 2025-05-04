import { PostgresClient } from "../clients/postgres";
import { RedisClient } from "../clients/redis";
import { generateShortId } from "../utils/encoder";

interface UrlServiceDependencies {
  postgresClient: PostgresClient;
  redisClient: RedisClient;
}

interface UrlService {
  createShortUrl(originalUrl: string): Promise<string>;
  getShortIdByOriginalUrl(originalUrl: string): Promise<string | null>;
  getOriginalUrl(shortId: string): Promise<string | null>;
  incrementUrlClickCount(shortId: string): Promise<void>;
}

export function buildUrlService(
  dependencies: UrlServiceDependencies
): UrlService {
  const { postgresClient, redisClient } = dependencies;
  const CACHE_TTL = 60 * 60 * 24; // 24 hours in seconds

  return {
    createShortUrl,
    getShortIdByOriginalUrl,
    getOriginalUrl,
    incrementUrlClickCount,
  };

  async function createShortUrl(originalUrl: string): Promise<string> {
    // NOTE: we can use bloom filters to reduce the number of queries to the database
    const existingShortId = await getShortIdByOriginalUrl(originalUrl);

    if (existingShortId) {
      return existingShortId;
    }

    let shortId = generateShortId();
    let isUnique = false;

    while (!isUnique) {
      const exists = await checkShortIdExists(shortId);

      if (exists) {
        shortId = generateShortId();
      } else {
        isUnique = true;
      }
    }

    await postgresClient.insert(shortId, originalUrl);

    await redisClient.set(shortId, originalUrl, CACHE_TTL);

    return shortId;
  }

  async function getShortIdByOriginalUrl(
    originalUrl: string
  ): Promise<string | null> {
    const result = await postgresClient.findShortIdByOriginalUrl(originalUrl);

    if (result.length > 0) {
      return result[0].short_id;
    }

    return null;
  }

  async function checkShortIdExists(shortId: string): Promise<boolean> {
    const result = await postgresClient.findByShortId(shortId);
    return result.rows.length > 0;
  }

  async function getOriginalUrl(shortId: string): Promise<string | null> {
    // Try to get from Redis cache first
    const cachedUrl = await redisClient.get(shortId);
    if (cachedUrl) {
      console.log("Cache hit for shortId:", shortId);
      return cachedUrl;
    }

    // If not in cache, query from PostgreSQL
    const result = await postgresClient.findOriginalUrlByShortId(shortId);

    if (result.rows.length > 0) {
      const originalUrl = result.rows[0].original_url;

      // Update cache for future requests
      await redisClient.set(shortId, originalUrl, CACHE_TTL);

      return originalUrl;
    }

    return null;
  }

  async function incrementUrlClickCount(shortId: string): Promise<void> {
    await postgresClient.updateClickCountByShortId(shortId);
  }
}
