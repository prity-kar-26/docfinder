import { Router } from "express";
import { searchDoctors, getDoctorById } from "../controllers/publicDoctor.controller";

const router = Router();

router.get("/search", searchDoctors);
router.get("/:id", getDoctorById);

export default router;