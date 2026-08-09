import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createWorkspace, getUserWorkspaces, getWorkspaceById, createSchedule, getTodayTasks, getWorkspaceProgress } from '../controllers/workspace.controllers.js';

const router = Router();

router.use(verifyJWT);

router.route("/").post(upload.single("syllabus"), createWorkspace);
router.route("/").get(getUserWorkspaces);
router.route("/:id").get(getWorkspaceById)
router.route("/:id/schedule").get(createSchedule);
router.route("/:id/today").get(getTodayTasks);
router.route("/:id/progress").get(getWorkspaceProgress);

export default router