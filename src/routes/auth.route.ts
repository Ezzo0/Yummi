import express from "express";
import {
  signup,
  login,
  logout,
  refreshToken,
} from "../controllers/auth.Controller";
import { protectRoute } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protectRoute, logout);
router.post("/refresh-token", refreshToken);

export default router;
