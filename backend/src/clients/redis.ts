import { createClient } from "redis";

export interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  quit(): Promise<void>;
}

export function buildRedisClient(): RedisClient {
  let isConnected: boolean = false;

  const client = createClient({
    url: `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  });

  client.on("error", (err) => console.error("Redis Client Error", err));

  connect();

  return {
    get,
    set,
    quit,
  };

  async function connect(): Promise<void> {
    if (!isConnected) {
      await client.connect();
      isConnected = true;
    }
  }

  async function get(key: string): Promise<string | null> {
    await connect();
    return await client.get(key);
  }

  async function set(
    key: string,
    value: string,
    ttlSeconds: number
  ): Promise<void> {
    await connect();
    await client.set(key, value, { EX: ttlSeconds });
  }

  async function quit(): Promise<void> {
    if (isConnected) {
      await client.quit();
      isConnected = false;
    }
  }
}
