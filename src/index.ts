import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db";
import authRoute from "./routes/auth.route";
import userRoute from "./routes/user.route";
import restaurantRoute from "./routes/restaurant.route";
import orderRoute from "./routes/order.route";

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(cookieParser());
app.use("/api/v1/orders/checkout/webhook", express.raw({ type: "*/*" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/restaurants", restaurantRoute);
app.use("/api/v1/orders", orderRoute);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
