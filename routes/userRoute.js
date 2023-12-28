import express from "express";
const router = express.Router();
import {
  allusers,
  loginUser,
  logoutUser,
  newUser,
  searchUserByName,
  selectedUserDetails,
  userDetails,
} from "../controllers/userController.js";
import { verifiedRoute } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multerMiddleware.js";

router.post("/register", upload.single("avatar"), newUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/all", verifiedRoute, allusers);
router.get("/me", verifiedRoute, userDetails);
router.get("/:id", verifiedRoute, selectedUserDetails);
router.get("/username/:username", verifiedRoute, searchUserByName);

export default router;
