import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  participant1: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  participant2: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  createdAt: { type: Date, default: Date.now },
}, {
  collection: 'conversations',
  versionKey: false
});

export const Conversation = mongoose.model('Conversation', ConversationSchema);
