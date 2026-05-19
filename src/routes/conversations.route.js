import express from "express";
import { autenticarToken } from "../middlewares/auth.middleware.js";
import {
  createOrGetConversation,
  listConversations,
  getConversation,
  eliminarConversacion,
} from "../controllers/conversations.controller.js";
import {
  getMessages,
  createMessage,
} from "../controllers/messages.controller.js";

const router = express.Router();

router.post("/", autenticarToken, createOrGetConversation);
router.get("/", autenticarToken, listConversations);
router.get("/:id", autenticarToken, getConversation);
router.delete("/:id", autenticarToken, eliminarConversacion);
router.get("/:conversationId/messages", autenticarToken, getMessages);
router.post("/:conversationId/messages", autenticarToken, createMessage);

export const conversationRoutes = router;
