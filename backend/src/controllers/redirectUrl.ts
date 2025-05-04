import { Request, Response } from "express";
import { buildUrlService } from "../services/urlService";
import { buildPostgresClient } from "../clients/postgres";
import { buildRedisClient } from "../clients/redis";

const postgresClient = buildPostgresClient();
const redisClient = buildRedisClient();

const urlService = buildUrlService({ postgresClient, redisClient });

export async function redirectUrl(
  req: Request,
  res: Response
): Promise<Response | void> {
  try {
    const { shortId } = req.params;

    if (!shortId) {
      return res.status(400).json({ error: "Short ID is required" });
    }

    const originalUrl = await urlService.getOriginalUrl(shortId);

    if (!originalUrl) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    // Async increment the click count in the database
    urlService.incrementUrlClickCount(shortId);

    res.redirect(originalUrl);
  } catch (error) {
    console.error("Error redirecting URL:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to redirect URL",
    });
  }
}
