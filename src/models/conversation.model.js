import mongoose from 'mongoose';


const ConversationSchema = new mongoose.Schema({
  // Array con los dos participantes normalizados (ordenados) para evitar A↔B y B↔A duplicadas
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  lastMessageAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
}, {
  collection: 'conversations',
  versionKey: false
});

// Índice normal para acelerar búsquedas por participantes sin imponer unicidad
ConversationSchema.index({ participants: 1 });

export const Conversation = mongoose.model('Conversation', ConversationSchema);
