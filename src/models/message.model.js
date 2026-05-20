import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  // Referencia a la conversación a la que pertenece este mensaje.
  // Guardamos el id en `conversationId` (más explícito) para facilitar consultas.
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },

  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },

  // receiver queda opcional para casos puntuales (notificaciones, DM directos),
  // pero las consultas principales deben hacerse por `conversation`.
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario',
    default: null
  },

  body: { 
    type: String, 
    required: true, 
    trim: true 
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  },
}, {
  collection: 'messages',
  versionKey: false
});

// Índice recomendado para recuperar rápidamente todos los mensajes de una conversación
// en orden cronológico (p. ej. para paginación o mostrar hilo).
MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model('Message', MessageSchema);