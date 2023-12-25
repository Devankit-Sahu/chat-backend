import express from "express";
const router = express.Router();
import { verifiedRoute } from "../middlewares/authMiddleware.js";
import { chatMessage, getChats } from "../controllers/chatController.js";

router.post("/message", verifiedRoute, chatMessage);
router.get("/chats/sender=:sender_id/reciever=:reciever_id", verifiedRoute, getChats);

export default router;
