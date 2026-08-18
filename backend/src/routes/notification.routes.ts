import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { getMyNotifications, markNotificationRead } from "../controllers/notification.controller";

const router = Router();

router.get("/", requireAuth, getMyNotifications);
router.put("/:id/read", requireAuth, markNotificationRead);

export default router;