import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { updateTaskStatus, toggleSubtopic } from "../controllers/task.controllers.js";

const router = Router();

router.use(verifyJWT);

router.route("/:id").patch(updateTaskStatus);
router.route("/:id/subtopic").patch(toggleSubtopic);

export default router;