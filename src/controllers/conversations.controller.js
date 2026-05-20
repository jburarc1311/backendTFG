import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import mongoose from "mongoose";

// Crear o devolver conversación entre dos participantes sin duplicados
export const createOrGetConversation = async (req, res) => {
  try {
    const { participant1, participant2 } = req.body;
    if (!participant1 || !participant2) {
      return res
        .status(400)
        .json({ message: "Se requieren dos participantes" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(participant1) ||
      !mongoose.Types.ObjectId.isValid(participant2)
    ) {
      return res.status(400).json({ message: "IDs de participantes inválidos" });
    }

    // Normalizar y ordenar los ids para buscar siempre la misma pareja
    const participants = [
      new mongoose.Types.ObjectId(participant1),
      new mongoose.Types.ObjectId(participant2),
    ].sort((a, b) => a.toString().localeCompare(b.toString()));

    // Buscar conversación que contenga solo estos dos participantes
    const existing = await Conversation.findOne({
      participants: { $all: participants},
    });

    if (existing) return res.json(existing); // Si ya existe, devuelve la conversación

    const conv = await Conversation.create({ // Si no existe, crea una nueva conversación
      participants,
      messages: [],
      lastMessage: null,
      lastMessageAt: null,
    });
    return res.status(201).json(conv);
  } catch (error) {
    console.error("createOrGetConversation error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const listConversations = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.user; // Saca el ID del usuario desde req.user si no intenta cogerlo desde la query
    if (!userId) return res.status(400).json({ message: "Falta user id" });

    const convs = await Conversation.find({ participants: userId }) // busca todas la conversaciones donde este aparece de participante
      .populate({ path: "participants", select: "name photo" })
      .populate({ path: "lastMessage", populate: { path: "sender", select: "name photo" } })
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .lean();

    return res.json(convs);
  } catch (error) {
    console.error("listConversations error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getConversation = async (req, res) => {
  try {
    const { id } = req.params; // id de la conversacion
    const conv = await Conversation.findById(id) //busca la conversacion 
      .populate({
        path: "messages", // rellena el array de mensajes con los datos de cada mensaje
        populate: [
          { path: "sender", select: "name photo" },
          { path: "receiver", select: "name photo" },
        ],
      })
      .populate({ path: "participants", select: "name photo" }) // Rellena los participantes de la conversación 
      .populate({ path: "lastMessage", populate: { path: "sender", select: "name photo" } }) // rellena el último mensaje
      .lean();
    if (!conv)
      return res.status(404).json({ message: "Conversación no encontrada" });

    return res.json(conv);
  } catch (error) {
    console.error("getConversation error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// Eliminar una conversación y todos sus mensajes asociados
export const eliminarConversacion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "ID de conversación inválido" });

    const conv = await Conversation.findById(id);
    if (!conv) return res.status(404).json({ message: "Conversación no encontrada" });

    // Comprobar que el usuario que solicita la eliminación es participante
    const isParticipant = conv.participants.some((p) => p.toString() === userId);
    if (!isParticipant)
      return res.status(403).json({ message: "No autorizado para eliminar esta conversación" });

    // Borrar mensajes asociados y la conversación
    await Message.deleteMany({ conversationId: conv._id });
    await Conversation.findByIdAndDelete(id);

    return res.json({ message: "Conversación y mensajes eliminados" });
  } catch (error) {
    console.error("eliminarConversacion error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};
