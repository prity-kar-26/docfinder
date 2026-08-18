import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import {
  getDoctorAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  toggleSlotBlock,
} from "../controllers/availability.controller";

const router = Router();

router.get("/doctors/:doctorId/availability", requireAuth, requireRole("CENTER"), getDoctorAvailability);
router.post("/doctors/:doctorId/availability", requireAuth, requireRole("CENTER"), createAvailability);
router.put("/availability/:id", requireAuth, requireRole("CENTER"), updateAvailability);
router.delete("/availability/:id", requireAuth, requireRole("CENTER"), deleteAvailability);
router.put("/availability/:id/toggle", requireAuth, requireRole("CENTER"), toggleSlotBlock);

export default router;