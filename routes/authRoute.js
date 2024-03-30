import express from "express";
const router = express.Router();
import { upload } from "../middlewares/multerMiddleware.js";
import { login, logout, register } from "../controllers/authController.js";

router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.get("/logout", logout);

export default router;
