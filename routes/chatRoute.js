import express from "express";
const router = express.Router();
import { verifiedRoute } from "../middlewares/authMiddleware.js";
import { chatMessage, getChats } from "../controllers/chatController.js";
import { upload } from "../middlewares/multerMiddleware.js";

router.post(
  "/message",
  verifiedRoute,
  upload.single("attachment"),
  chatMessage
);
router.get("/chats/sender=:sender_id/reciever=:reciever_id", verifiedRoute, getChats);

export default router;
