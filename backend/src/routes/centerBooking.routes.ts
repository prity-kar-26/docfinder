import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { getCenterBookings, cancelBookingAsCenter, togglePaidStatus, createOfflineBooking } from "../controllers/centerBooking.controller";

const router = Router();

router.get("/", requireAuth, requireRole("CENTER"), getCenterBookings);
router.put("/:id/cancel", requireAuth, requireRole("CENTER"), cancelBookingAsCenter);
router.put("/:id/paid", requireAuth, requireRole("CENTER"), togglePaidStatus);
router.post("/", requireAuth, requireRole("CENTER"), createOfflineBooking);

export default router;