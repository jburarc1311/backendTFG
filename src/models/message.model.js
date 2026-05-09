import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  participant1: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, index: true },
  participant2: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  body: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
}, {
  collection: 'messages',
  versionKey: false
});

MessageSchema.index({ participant1: 1, participant2: 1, createdAt: 1 });

export const Message = mongoose.model('Message', MessageSchema);
