import express from "express";
const router = express.Router();
import {
  myDetails,
  updateMyDetails,
  allMyFriends,
  sendFriendRequest,
  acceptFriendRequest,
  searchUser,
  requestNotificaton,
} from "../controllers/userController.js";
import { verifiedRoute } from "../middlewares/authMiddleware.js";

router.get("/me", verifiedRoute, myDetails);
router.put("/update", verifiedRoute, updateMyDetails);
router.get("/my-friends", verifiedRoute, allMyFriends);
router.post("/send-friend-request", verifiedRoute, sendFriendRequest);
router.put("/accept-friend-request", verifiedRoute, acceptFriendRequest);
router.get("/search", verifiedRoute, searchUser);
router.get("/notification", verifiedRoute, requestNotificaton);

export default router;
