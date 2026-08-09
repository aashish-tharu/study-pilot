import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { updateTaskStatus } from "../controllers/task.controllers.js";

const router = Router();

router.use(verifyJWT);

router.route("/:id").patch(updateTaskStatus);

export default router;