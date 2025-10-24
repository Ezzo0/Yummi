import { Request, Response, NextFunction } from "express";
import aj from "../config/arcjet";
import { isSpoofedBot } from "@arcjet/inspect";
import { ArcjetNodeRequest } from "@arcjet/node";

/**
 * Arcjet Protection Middleware
 *
 * This middleware provides security protection for API routes using Arcjet.
 * It implements:
 * - Rate limiting: Prevents abuse by limiting requests per time window
 * - Bot detection: Blocks malicious bots while allowing legitimate crawlers
 * - Spoofed bot detection: Identifies bots pretending to be legitimate services
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function to pass control to the next middleware
 */
export const arcjetProtection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Run the request through Arcjet's protection rules
    // Cast to ArcjetNodeRequest type for compatibility with Arcjet SDK
    const decision = await aj.protect(req as ArcjetNodeRequest);

    // Check if the request was denied by any security rule
    if (decision.isDenied()) {
      // Handle rate limit violations (too many requests from same source)
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ message: "Too Many Requests" });
      }
      // Handle bot detection (malicious or unwanted bots)
      else if (decision.reason.isBot()) {
        return res.status(403).json({ message: "No bots allowed" });
      }
      // Handle other security policy violations
      else {
        return res
          .status(403)
          .json({ message: "Access denied by security policy" });
      }
    }

    // Additional check for spoofed bots (bots lying about their identity)
    // These are bots pretending to be Google, Bing, etc. but aren't legitimate
    if (decision.results.some(isSpoofedBot)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // If all security checks pass, proceed to the next middleware/route handler
    next();
  } catch (error) {
    // Log any errors during security check execution
    console.log("Error in arcjetProtection middleware", error);
    // Return 500 error to prevent exposing internal security details
    res.status(500).json({ message: "Internal server error" });
  }
};
