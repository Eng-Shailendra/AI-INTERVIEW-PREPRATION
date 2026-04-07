
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { connectDB } from "./config/database-config.js";
import userRoutes from "./routes/auth-route.js";
import sessionRoutes from "./routes/session-route.js";
import aiRoutes from "./routes/ai-route.js";

let app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ai-interview-prepration-eta.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));// this 
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/ai", aiRoutes);


connectDB().catch(err => {
  console.error("Failed to connect to MongoDB", err);
  process.exit(1);
})
app.listen(process.env.PORT || 9001, () => {
  console.log("Server Started..... on PORT || 9001");
});

