import express from "express";
const router = express.Router();
import { verifiedRoute } from "../middlewares/authMiddleware.js";
import {
  addAttachments,
  chatMessage,
  deleteChats,
  deleteSingleChat,
  getChats,
} from "../controllers/chatController.js";
import { upload } from "../middlewares/multerMiddleware.js";

router.post("/message", verifiedRoute, chatMessage);
router.post(
  "/add/attachments",
  verifiedRoute,
  upload.single("attachment"),
  addAttachments
);
router.get("/sender=:sender_id/reciever=:reciever_id", verifiedRoute, getChats);
router.delete("/delete/sender=:sender_id/reciever=:reciever_id", verifiedRoute, deleteChats);
router.delete("/delete/chat-id=:chat_id", verifiedRoute, deleteSingleChat);

export default router;
