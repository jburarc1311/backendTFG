import { Conversation } from "../models/conversation.model.js";
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

    const [firstParticipant, secondParticipant] = [
      new mongoose.Types.ObjectId(participant1),
      new mongoose.Types.ObjectId(participant2),
    ].sort((a, b) => a.toString().localeCompare(b.toString()));

    const existing = await Conversation.findOne({
      $or: [
        { participant1: firstParticipant, participant2: secondParticipant },
        { participant1: secondParticipant, participant2: firstParticipant },
      ],
    });

    if (existing) return res.json(existing);

    const conv = await Conversation.create({
      participant1: firstParticipant,
      participant2: secondParticipant,
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
    const userId = req.user?.id || req.query.user;
    if (!userId) return res.status(400).json({ message: "Falta user id" });

    const convs = await Conversation.find({
      $or: [{ participant1: userId }, { participant2: userId }],
    })
      .populate({ path: "participant1", select: "name photo" })
      .populate({ path: "participant2", select: "name photo" })
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
    const { id } = req.params;
    const conv = await Conversation.findById(id)
      .populate({
        path: "messages",
        populate: [
          { path: "sender", select: "name photo" },
          { path: "receiver", select: "name photo" },
        ],
      })
      .populate({ path: "participant1", select: "name photo" })
      .populate({ path: "participant2", select: "name photo" })
      .populate({ path: "lastMessage", populate: { path: "sender", select: "name photo" } })
      .lean();
    if (!conv)
      return res.status(404).json({ message: "Conversación no encontrada" });

    return res.json(conv);
  } catch (error) {
    console.error("getConversation error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};
