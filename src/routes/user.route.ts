import express from "express";
import { getUser, updateUser } from "../controllers/user.controller";
import { protectRoute } from "../middleware/auth.middleware";
import { validateUserUpdateRequest } from "../middleware/validation";
import { arcjetProtection } from "../middleware/arcjet.middleware";
const router = express.Router();
router.use(arcjetProtection);

router.get("/me", protectRoute, getUser);
router.put("/profile", protectRoute, validateUserUpdateRequest, updateUser);

export default router;
