import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check — hit this first to confirm the server is running
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "DocFinder API is running" });
});

// Routes will be mounted here as we build each phase, e.g.:
// import authRoutes from "./routes/auth.routes";
// app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`DocFinder backend listening on http://localhost:${PORT}`);
});
