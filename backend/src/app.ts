import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://docfinder-ten.vercel.app",
  "https://docfinder-o4hn9m796-prity3.vercel.app/"
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman, curl, or server-to-server calls)
    if (!origin || allowedOrigins.includes(origin)) {   //this specifically allows tools like Postman (which don't send an Origin header) to keep working for your own testing, without opening the door to arbitrary websites.
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
}));
// app.use(cors()); - fine for localhost, This allows any website on the internet to call your API
app.use(express.json());

// Health check — hit this first to confirm the server is running
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "DocFinder API is running" });
});


import authRoutes from "./routes/auth.routes";
app.use("/api/auth", authRoutes);

import centerRoutes from "./routes/center.routes";
app.use("/api/center", centerRoutes);

import overviewRoutes from "./routes/overview.routes";
app.use("/api/center/overview", overviewRoutes);

import availabilityRoutes from "./routes/availability.routes";
app.use("/api/center", availabilityRoutes);

import centerBookingRoutes from "./routes/centerBooking.routes";
app.use("/api/center/bookings", centerBookingRoutes);

import publicDoctorRoutes from "./routes/publicDoctor.routes";
app.use("/api/doctors", publicDoctorRoutes);

import earningsRoutes from "./routes/earnings.routes";
app.use("/api/center/earnings", earningsRoutes);

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
