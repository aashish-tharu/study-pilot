import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createWorkspace, getUserWorkspaces, getWorkspaceById } from '../controllers/workspace.controllers.js';

const router = Router();

router.use(verifyJWT);

router.route("/").post(upload.single("syllabus"), createWorkspace);
router.route("/").get(getUserWorkspaces);
router.route("/:id").get(getWorkspaceById)

export default router