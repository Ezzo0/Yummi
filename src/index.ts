import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db";
import authRoute from "./routes/auth.route";
import userRoute from "./routes/user.route";

// Connect to MongoDB
connectDB();
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
