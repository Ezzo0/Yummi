import express from "express";
import { getUser, updateUser } from "../controllers/user.controller";
import { protectRoute } from "../middleware/auth.middleware";

const router = express.Router();
router.get("/me", protectRoute, getUser);
router.put("/update-profile", protectRoute, updateUser);

export default router;
