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

app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
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
