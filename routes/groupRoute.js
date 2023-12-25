import express from "express";
const router = express.Router();
import { verifiedRoute } from "../middlewares/authMiddleware.js";
import {
  createGroup,
  createGroupChat,
  getAllGroups,
  getGroupChats,
  getGroupDetails,
} from "../controllers/groupController.js";

router.post("/newgroup", verifiedRoute, createGroup);
router.get("/allgroups", verifiedRoute, getAllGroups);
router.get("/group-id/:group_id", verifiedRoute, getGroupDetails);
router.post("/groupchat", verifiedRoute, createGroupChat);
router.get("/allgroupchat/:group_id", verifiedRoute, getGroupChats);

export default router;
