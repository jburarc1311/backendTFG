import mongoose from 'mongoose';


const ConversationSchema = new mongoose.Schema({
  // Array con los dos participantes normalizados (ordenados) para evitar A↔B y B↔A duplicadas
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  createdAt: { type: Date, default: Date.now },
}, {
  collection: 'conversations',
  versionKey: false
});

// Índice único sobre la lista de participantes (la array debe guardarse ordenada)
ConversationSchema.index({ participants: 1 }, { unique: true });

export const Conversation = mongoose.model('Conversation', ConversationSchema);
