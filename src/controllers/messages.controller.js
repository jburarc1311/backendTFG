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

    // Asegurarse de que la conversación tiene al menos dos participantes
    if (!Array.isArray(conversation.participants) || conversation.participants.length < 2) {
      return res.status(400).json({ message: "Conversación inválida: participantes insuficientes" });
    }

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    // Obtener participantes desde conversation.participants (array normalizado)
    const participant1 = conversation.participants[0].toString();
    const participant2 = conversation.participants[1].toString();

    if (!mongoose.Types.ObjectId.isValid(senderId) || ![participant1, participant2].includes(senderObjectId.toString())) {
      return res
        .status(403)
        .json({ message: "No perteneces a esta conversación" });
    }


    const receiverId =
      senderObjectId.toString() === participant1
        ? conversation.participants[1]
        : conversation.participants[0];

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

