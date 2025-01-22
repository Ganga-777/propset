import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routs/authRoute.js";
import cors from "cors";
import categoryRoutes from './routs/categoryRoutes.js';
import productRoutes from './routs/productRoutes.js'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//configure env
dotenv.config();

//database config
connectDB().then(() => {
    console.log("MongoDB connected successfully");
}).catch((err) => {
    console.log("MongoDB connection error: ", err);
});

//rest object
const app = express();

//middlewares
app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("http://localhost:8081/api/v1/auth", authRoutes);
app.use("http://localhost:8081/api/v1/category", categoryRoutes);
app.use("http://localhost:8081/api/v1/product", productRoutes);

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve static files only in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message
  });
});

//PORT
const PORT = process.env.PORT || 8081;

//run listen
app.listen(PORT, () => {
  console.log(
    `Server Running on ${process.env.DEV_MODE} mode on port ${PORT}`.bgCyan.white
  );
});