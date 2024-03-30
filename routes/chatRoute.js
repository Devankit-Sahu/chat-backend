import express from "express";
const router = express.Router();
import { verifiedRoute } from "../middlewares/authMiddleware.js";
import {
  newGroup,
  newMessage,
  getChats,
  getAllGroups,
  addMembers,
  removeMembers,
  leaveGroup,
  getAllMessages,
  deleteAllMessages,
  searchChat,
  getChatDetails,
} from "../controllers/chatController.js";
import { upload } from "../middlewares/multerMiddleware.js";

router.post("/new-group", verifiedRoute, upload.array("profile", 5), newGroup);
router.post("/message", verifiedRoute, upload.array("files", 5), newMessage);
router.get("/mychats", verifiedRoute, getChats);
router.get("/all-groups", verifiedRoute, getAllGroups);
router.put("/add-members", verifiedRoute, addMembers);
router.put("/remove-member", verifiedRoute, removeMembers);
router.put("/leave-group", verifiedRoute, leaveGroup);
router.get("/search", verifiedRoute, searchChat);
router.get("/message/:chatId", getAllMessages);
router
  .route("/:chatId")
  .get(verifiedRoute, getChatDetails)
  .delete(verifiedRoute, deleteAllMessages);

export default router;
