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

router.post("/register", newUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/all", verifiedRoute, allusers);
router.get("/me", verifiedRoute, userDetails);
router.get("/:id", verifiedRoute, selectedUserDetails);
router.get("/username/:username", verifiedRoute, searchUserByName);

export default router;
