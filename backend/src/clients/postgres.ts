import bloomFilters from "bloom-filters";
import { Pool, QueryResult } from "pg";

const { BloomFilter } = bloomFilters;

export interface PostgresClient {
  insert: (shortId: string, originalUrl: string) => Promise<QueryResult | void>;
  findByShortId: (shortId: string) => Promise<QueryResult | void>;
  findOriginalUrlByShortId: (shortId: string) => Promise<QueryResult | void>;
  updateClickCountByShortId: (shortId: string) => Promise<QueryResult | void>;
  findShortIdByOriginalUrl: (
    originalUrl: string
  ) => Promise<{ short_id: string }[]>;
}

type PoolConfig = Record<
  string,
  {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  }
>;

function generatePoolConfig(): PoolConfig {
  const poolConfig: PoolConfig = {};
  [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ].forEach((char) => {
    poolConfig[char] = {
      host: process.env.POSTGRES_HOST || "localhost",
      port: parseInt(process.env.POSTGRES_PORT || "5432"),
      database: `urls_${char}`,
      user: process.env.POSTGRES_USER || "postgres",
      password: process.env.POSTGRES_PASSWORD || "postgres",
    };
  });

  poolConfig["default"] = {
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    database: `urls_default`,
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
  };

  return poolConfig;
}

const shardConfigs = generatePoolConfig();

const shardPools: Record<string, Pool> = {};

const bloom = new BloomFilter(
  10 * 1024 * 1024 * 8, // ~10MB of memory
  7 // num hashes
);

export async function initDatabaseTables(): Promise<void> {
  for (const [shard, pool] of Object.entries(shardPools)) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS urls (
          id SERIAL PRIMARY KEY,
          short_id VARCHAR(10) NOT NULL UNIQUE,
          original_url TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          click_count INT DEFAULT 0,
          last_accessed TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_urls_short_id ON urls (short_id);

        CREATE INDEX IF NOT EXISTS idx_urls_original_url ON urls (original_url);
      `);
    } catch (error) {
      console.error(`Failed to initialize tables for shard ${shard}:`, error);
    }
  }
}

function getPoolForShortId(shortId: string): Pool {
  if (!shortId || shortId.length === 0) {
    return shardPools.default;
  }

  const firstChar = shortId[0].toLowerCase();
  return shardPools[firstChar] || shardPools.default;
}

export function initDatabaseConnections(): void {
  // Create a connection pool for each shard
  for (const [shard, config] of Object.entries(shardConfigs)) {
    shardPools[shard] = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: parseInt(process.env.MAX_POOL_SIZE || "20", 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    shardPools[shard].on("error", (err) => {
      console.error("Unexpected pool error", err);
      process.exit(-1);
    });

    // Test connection
    shardPools[shard].query("SELECT NOW()", (err) => {
      if (err) {
        console.error(`Failed to connect to shard ${shard}:`, err);
      } else {
        console.log(`Connected to shard ${shard}`);
      }
    });
  }

  loadBloomFilter();
}

export async function loadBloomFilter(): Promise<void> {
  console.log("Load bloom filter");
  const rows: { original_url: string }[] = [];

  await Promise.all(
    Object.values(shardPools).map(async (pool) => {
      try {
        const result = await pool.query("SELECT original_url FROM urls");

        if (result) {
          rows.push(...result.rows);
        }
      } catch (error) {
        console.error("Error querying shard:", error);
        throw error;
      }
    })
  );

  rows.forEach((row) => {
    bloom.add(row.original_url);
  });

  console.log("Bloom filter loaded with original URLs");
}

export async function closeDatabaseConnections(): Promise<void> {
  await Promise.all(Object.values(shardPools).map((pool) => pool.end()));
  console.log("All database connections closed");
}

export async function buildPostgresClient(): Promise<PostgresClient> {
  return {
    insert,
    findByShortId,
    findOriginalUrlByShortId,
    updateClickCountByShortId,
    findShortIdByOriginalUrl,
  };

  async function insert(
    shortId: string,
    originalUrl: string
  ): Promise<QueryResult | void> {
    const pool = getPoolForShortId(shortId);

    bloom.add(originalUrl);

    try {
      return pool.query(
        "INSERT INTO urls (short_id, original_url, created_at) VALUES ($1, $2, NOW())",
        [shortId, originalUrl]
      );
    } catch (error) {
      console.error("Error inserting URL:", error);
      throw error;
    }
  }

  async function findByShortId(shortId: string): Promise<QueryResult | void> {
    const pool = getPoolForShortId(shortId);

    try {
      return pool.query("SELECT 1 FROM urls WHERE short_id = $1 LIMIT 1", [
        shortId,
      ]);
    } catch (error) {
      console.error("Error finding short ID:", error);
      throw error;
    }
  }

  async function findOriginalUrlByShortId(
    shortId: string
  ): Promise<QueryResult | void> {
    const pool = getPoolForShortId(shortId);

    try {
      return pool.query(
        "SELECT original_url FROM urls WHERE short_id = $1 LIMIT 1",
        [shortId]
      );
    } catch (error) {
      console.error("Error finding original URL by short ID:", error);
      throw error;
    }
  }

  async function queryAllShards<T>(
    query: string,
    params?: any[]
  ): Promise<T[]> {
    const allResults: T[] = [];

    await Promise.all(
      Object.values(shardPools).map(async (pool) => {
        try {
          const result = await pool.query(query, params);

          if (result) {
            allResults.push(...result.rows);
          }
        } catch (error) {
          console.error("Error querying shard:", error);
          throw error;
        }
      })
    );

    return allResults;
  }

  async function findShortIdByOriginalUrl(
    originalUrl: string
  ): Promise<{ short_id: string }[]> {
    if (!bloom.has(originalUrl)) {
      return [];
    }

    return await queryAllShards(
      "SELECT short_id FROM urls WHERE original_url = $1 LIMIT 1",
      [originalUrl]
    );
  }

  async function updateClickCountByShortId(
    shortId: string
  ): Promise<QueryResult | void> {
    const pool = getPoolForShortId(shortId);

    try {
      return pool.query(
        "UPDATE urls SET click_count = click_count + 1 WHERE short_id = $1",
        [shortId]
      );
    } catch (error) {
      console.error("Error updating click count for short ID:", error);
      throw error;
    }
  }
}
