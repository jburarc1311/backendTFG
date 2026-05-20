import { Message } from "../models/message.model.js";
import { Conversation } from "../models/conversation.model.js";
import mongoose from "mongoose";

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params; //id de la conversacion
    const conversation = await Conversation.findById(conversationId) // la busca
      .populate("messages") // sustituye el array de mensajes por los datos de cada mensaje
      .lean(); //lo devuelve

    if (!conversation) {
      return res.status(404).json({ message: "Conversación no encontrada" });
    }

    return res.json(conversation.messages || []);
  } catch (error) {
    console.error("getMessages error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const createMessage = async (req, res) => {
  try {
    const { conversationId } = req.params; // id de la conversacion
    const senderId = req.user?.id || req.body.sender;
    const { body } = req.body;

    if (!body)
      return res
        .status(400)
        .json({ message: "El mensaje no puede estar vacío" });
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "ID de conversación no válido" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversación no encontrada" });
    }

    // Asegurarse de que la conversación tiene los dos participantes definidos
    if (!conversation.participant1 || !conversation.participant2) {
      return res.status(400).json({ message: "Conversación inválida: participantes insuficientes" });
    }

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const p1 = conversation.participant1.toString();
    const p2 = conversation.participant2.toString();

    if (!mongoose.Types.ObjectId.isValid(senderId) || ![p1, p2].includes(senderObjectId.toString())) {
      return res.status(403).json({ message: "No perteneces a esta conversación" });
    }

    const receiverId = senderObjectId.toString() === p1 ? conversation.participant2 : conversation.participant1;

    // Crear mensaje asociado a la conversación
    const msg = await Message.create({
      conversationId: conversationId,
      sender: senderObjectId,
      receiver: receiverId,
      body,
    });

    // Actualizar la conversación: añadir el mensaje y actualizar lastMessage y su fecha
    await Conversation.findByIdAndUpdate(conversationId, {
      $push: { messages: msg._id },
      lastMessage: msg._id,
      lastMessageAt: msg.createdAt,
    });

    // Devolver el mensaje poblado para que el cliente tenga datos de usuario
    const populated = await Message.findById(msg._id)
      .populate('sender', 'name photo')
      .populate('receiver', 'name photo')
      .lean();

    return res.status(201).json(populated);
  } catch (error) {
    console.error("createMessage error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

