// Import dependencies
import express from "express";
import cors from "cors";
import productRoute from "./route/productRoute.js";
import "dotenv/config";
import db from "./connectdb.js";
import cookieParser from "cookie-parser";
import authRouter from "./route/authRoutes.js";
import userRouter from "./route/userRoutes.js";

const app = express();

const allowedOrigins = [
  'https://jeans-store.netlify.app',
  'http://localhost:3000',
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log("Incoming request from origin:", origin);

  // Check if the origin is allowed
  if (allowedOrigins.includes(origin) || !origin) {
    // If allowed, set the Access-Control-Allow-Origin header with the request origin
    res.header("Access-Control-Allow-Origin", origin || "*");
  }

  // Set additional CORS headers (methods, headers, etc.)
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  // For preflight requests, respond quickly
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());
app.use(cookieParser());
app.use("/products", express.static("upload/products"));
app.use('/auth', authRouter)
app.use('/user', userRouter)

db();

app.use("/products", productRoute)  

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
