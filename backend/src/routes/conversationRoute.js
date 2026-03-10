import express from "express";
import {
  createConversation,
  getConversations,
  getMessages,
  markAsSeen,
  hideConversation,
  leaveConversation,
} from "../controllers/conversationController.js";
import { checkFriendship } from "../middlewares/friendMiddleware.js";

const router = express.Router();

router.post("/", checkFriendship, createConversation);
router.get("/", getConversations);
router.get("/:conversationId/messages", getMessages);
router.patch("/:conversationId/seen", markAsSeen);
router.patch("/:conversationId/hide", hideConversation);
router.patch("/:conversationId/leave", leaveConversation);

export default router;
