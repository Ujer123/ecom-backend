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

app.use(cors({
  origin: "https://jeans-store.netlify.app/",
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

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
