import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import destinationRoutes from "./routes/destinationRoutes.js";
import leadGenerationRoutes from "./routes/leadGenerationRoutes.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5050;

// Core middleware FIRST
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
    );
    next();
});

// Routes AFTER middleware
app.use("/api/auth", authRoutes);
app.use("/api", destinationRoutes);
app.use("/api", leadGenerationRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
