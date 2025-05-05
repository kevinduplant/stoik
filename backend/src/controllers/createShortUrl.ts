import { Request, Response } from "express";
import { buildUrlService } from "../services/urlService.js";
import { buildPostgresClient } from "../clients/postgres.js";
import { buildRedisClient } from "../clients/redis.js";
import config from "../config.js";
import z from "zod";
import he from "he";
import QRCode from "qrcode";

const postgresClient = await buildPostgresClient();
const redisClient = buildRedisClient();

const urlService = buildUrlService({ postgresClient, redisClient });

const ZBodySchema = z.object({
  url: z.string().url(),
});

export async function createShortUrl(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Validate the request body using Zod
    try {
      ZBodySchema.parse(req.body);
    } catch (error) {
      console.error("Invalid Body format:", error);
      return res.status(400).json({ error: "Invalid URL format" });
    }

    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Sanitize the URL to prevent XSS attacks
    const safeUrl = he.encode(url);

    try {
      new URL(safeUrl);
    } catch (error) {
      console.error("Invalid URL format:", error);
      return res.status(400).json({ error: "Invalid URL format" });
    }

    console.log("Creating short URL for:", safeUrl);

    const shortId = await urlService.createShortUrl(safeUrl);

    const qrCode = await QRCode.toString(`${config.app.baseUrl}/${shortId}`, {
      type: "svg",
    });

    return res.status(201).json({
      shortUrl: `${config.app.baseUrl}/${shortId}`,
      shortId,
      qrCode,
    });
  } catch (error) {
    console.error("Error creating short URL:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to create short URL",
    });
  }
}
