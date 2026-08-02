import { Router } from "express"
import { registerUser, loginUser, logoutUser, refreshAccessToken, updatePassword, getCurrentUser} from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

let router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/updatepassword").post(verifyJWT, updatePassword)
router.route("/getcurrentuser").post(verifyJWT, getCurrentUser)

export default router