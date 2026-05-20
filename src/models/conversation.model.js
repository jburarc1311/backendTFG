import mongoose from 'mongoose';


const ConversationSchema = new mongoose.Schema({
  // Dos campos explícitos para participantes (más claro y fácil de poblar)
  participant1: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  participant2: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  lastMessageAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
}, {
  collection: 'conversations',
  versionKey: false
});

// Índices no únicos para acelerar búsquedas por participante individual
ConversationSchema.index({ participant1: 1 });
ConversationSchema.index({ participant2: 1 });

export const Conversation = mongoose.model('Conversation', ConversationSchema);