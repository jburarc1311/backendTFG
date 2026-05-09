import express from "express";
import { autenticarToken } from "../middlewares/auth.middleware.js";
import {
  createOrGetConversation,
  listConversations,
  getConversation,
} from "../controllers/conversations.controller.js";
import {
  getMessages,
  createMessage,
  deleteMessage,
} from "../controllers/messages.controller.js";

const router = express.Router();

// Crear o devolver conversación entre participantes
router.post("/", autenticarToken, createOrGetConversation);

// Listar conversaciones del usuario autenticado
router.get("/", autenticarToken, listConversations);

// Obtener conversación + últimos mensajes
router.get("/:id", autenticarToken, getConversation);

// Mensajes de una conversación
router.get("/:conversationId/messages", autenticarToken, getMessages);
router.post("/:conversationId/messages", autenticarToken, createMessage);
router.delete(
  "/:conversationId/messages/:messageId",
  autenticarToken,
  deleteMessage,
);

export const conversationRoutes = router;
