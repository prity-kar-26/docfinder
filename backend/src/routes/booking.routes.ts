import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { createBooking, getMyBookings, cancelBooking } from "../controllers/booking.controller";

const router = Router();

router.post("/", requireAuth, requireRole("PATIENT"), createBooking);
router.get("/", requireAuth, requireRole("PATIENT"), getMyBookings);
router.put("/:id/cancel", requireAuth, requireRole("PATIENT"), cancelBooking);

export default router;