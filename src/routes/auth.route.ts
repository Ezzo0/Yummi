import express from "express";
import {
  signup,
  login,
  logout,
  refreshToken,
} from "../controllers/auth.controller";
import { protectRoute } from "../middleware/auth.middleware";
import {
  validateSignupRequest,
  validateLoginRequest,
} from "../middleware/validation";
import { arcjetProtection } from "../middleware/arcjet.middleware";

const router = express.Router();

router.use(arcjetProtection);

router.post("/signup", validateSignupRequest, signup);
router.post("/login", validateLoginRequest, login);
router.post("/logout", protectRoute, logout);
router.post("/refresh-token", refreshToken);

export default router;
