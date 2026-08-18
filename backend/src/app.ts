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


import authRoutes from "./routes/auth.routes";
app.use("/api/auth", authRoutes);

import centerRoutes from "./routes/center.routes";
app.use("/api/center", centerRoutes);

import availabilityRoutes from "./routes/availability.routes";
app.use("/api/center", availabilityRoutes);

import centerBookingRoutes from "./routes/centerBooking.routes";
app.use("/api/center/bookings", centerBookingRoutes);

import publicDoctorRoutes from "./routes/publicDoctor.routes";
app.use("/api/doctors", publicDoctorRoutes);

import bookingRoutes from "./routes/booking.routes";
app.use("/api/bookings", bookingRoutes);

import profileRoutes from "./routes/profile.routes";
app.use("/api/profile", profileRoutes);

import notificationRoutes from "./routes/notification.routes";
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`DocFinder backend listening on http://localhost:${PORT}`);
});
