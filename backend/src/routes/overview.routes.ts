import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { getOverview } from "../controllers/overview.controller";

const router = Router();

router.get("/", requireAuth, requireRole("CENTER"), getOverview);

export default router;