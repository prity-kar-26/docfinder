import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { getMyCenterProfile, updateMyCenterProfile } from "../controllers/center.controller";
import { getMyDoctors, createDoctor, updateDoctor } from "../controllers/doctorListing.controller";

const router = Router();

router.get("/me", requireAuth, requireRole("CENTER"), getMyCenterProfile);
router.put("/me", requireAuth, requireRole("CENTER"), updateMyCenterProfile);

router.get("/doctors", requireAuth, requireRole("CENTER"), getMyDoctors);
router.post("/doctors", requireAuth, requireRole("CENTER"), createDoctor);
router.put("/doctors/:id", requireAuth, requireRole("CENTER"), updateDoctor);

export default router;