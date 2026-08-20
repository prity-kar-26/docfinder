import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { getEarnings } from "../controllers/earnings.controller";

const router = Router();

router.get("/", requireAuth, requireRole("CENTER"), getEarnings);

export default router;