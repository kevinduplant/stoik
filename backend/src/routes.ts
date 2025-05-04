import { Router } from "express";
import { createShortUrl } from "./controllers/createShortUrl";
import { redirectUrl } from "./controllers/redirectUrl";

const router = Router();

// Create short URL
// @ts-expect-error ---
router.post("/shorten", createShortUrl);

// Redirect to original URL
// @ts-expect-error ---
router.get("/:shortId", redirectUrl);

export default router;
