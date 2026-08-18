import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { getMyUser, updateMyUser } from "../controllers/profile.controller";

const router = Router();

router.get("/me", requireAuth, getMyUser);
router.put("/me", requireAuth, updateMyUser);

export default router;