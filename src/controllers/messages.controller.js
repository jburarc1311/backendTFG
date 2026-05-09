import { Message } from "../models/message.model.js";
import { Conversation } from "../models/conversation.model.js";
import mongoose from "mongoose";

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId)
      .populate("messages")
      .lean();

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
    const { conversationId } = req.params;
    const senderId = req.user?.id || req.body.sender;
    const { body } = req.body;

    if (!body)
      return res
        .status(400)
        .json({ message: "El mensaje no puede estar vacío" });

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversación no encontrada" });
    }

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const participant1 = conversation.participant1.toString();
    const participant2 = conversation.participant2.toString();

    if (![participant1, participant2].includes(senderObjectId.toString())) {
      return res
        .status(403)
        .json({ message: "No perteneces a esta conversación" });
    }

    const receiverId =
      senderObjectId.toString() === participant1
        ? conversation.participant2
        : conversation.participant1;

    const msg = await Message.create({
      participant1: conversation.participant1,
      participant2: conversation.participant2,
      sender: senderObjectId,
      receiver: receiverId,
      body,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      $push: { messages: msg._id },
      lastMessage: msg._id,
      lastMessageAt: msg.createdAt,
    });

    return res.status(201).json(msg);
  } catch (error) {
    console.error("createMessage error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { conversationId, messageId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversación no encontrada" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Mensaje no encontrado" });
    }

    const inConversation =
      message.participant1.toString() ===
        conversation.participant1.toString() &&
      message.participant2.toString() === conversation.participant2.toString();

    const inReverseConversation =
      message.participant1.toString() ===
        conversation.participant2.toString() &&
      message.participant2.toString() === conversation.participant1.toString();

    if (!inConversation && !inReverseConversation) {
      return res
        .status(403)
        .json({ message: "El mensaje no pertenece a esta conversación" });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Solo puedes eliminar tus propios mensajes" });
    }

    await Message.findByIdAndDelete(messageId);

    const updatedMessages = (conversation.messages || []).filter(
      (id) => id.toString() !== messageId.toString(),
    );

    const updatePayload = {
      messages: updatedMessages,
    };

    if (conversation.lastMessage?.toString() === messageId.toString()) {
      const previousMessage = await Message.findOne({
        participant1: conversation.participant1,
        participant2: conversation.participant2,
        _id: { $ne: messageId },
      })
        .sort({ createdAt: -1 })
        .lean();

      updatePayload.lastMessage = previousMessage ? previousMessage._id : null;
      updatePayload.lastMessageAt = previousMessage
        ? previousMessage.createdAt
        : null;
    }

    await Conversation.findByIdAndUpdate(conversationId, updatePayload);

    return res.json({ message: "Mensaje eliminado correctamente" });
  } catch (error) {
    console.error("deleteMessage error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};
