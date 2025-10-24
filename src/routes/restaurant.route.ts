import express from "express";
import { param } from "express-validator";
import { protectRoute } from "../middleware/auth.middleware";
import { validateMyRestaurantRequest } from "../middleware/validation";
import upload from "../middleware/uploadImage.middleware";
import {
  createMyRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
  getRestaurantById,
  searchRestaurant,
  updateOrderStatus,
} from "../controllers/restaurant.controller";

const router = express.Router();
router.use(protectRoute);

router.post(
  "/create-restaurant",
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  createMyRestaurant
);
router
  .route("/")
  .get(getMyRestaurant)
  .put(
    upload.single("imageFile"),
    validateMyRestaurantRequest,
    updateMyRestaurant
  );

router.get(
  "/:restaurantId",
  param("restaurantId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("RestaurantId paramenter must be a valid string"),
  getRestaurantById
);

router.get(
  "/search/:city",
  param("city")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("City paramenter must be a valid string"),
  searchRestaurant
);

router.patch("/order/:orderId/status", protectRoute, updateOrderStatus);

export default router;
