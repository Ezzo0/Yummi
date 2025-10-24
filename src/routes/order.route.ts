import express from "express";
import { protectRoute } from "../middleware/auth.middleware";
import {
  createCheckoutSession,
  getMyOrders,
  stripeWebhookHandler,
} from "../controllers/order.controller";

const router = express.Router();

router.get("/", protectRoute, getMyOrders);

router.post("/create-checkout-session", protectRoute, createCheckoutSession);

router.post("/checkout/webhook", stripeWebhookHandler);

export default router;
