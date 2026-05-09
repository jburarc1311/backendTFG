// models/Solicitud.js
import mongoose from 'mongoose';

export const Solicitud = mongoose.model('Solicitud', new mongoose.Schema(
  {
    perro_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Perro',
      required: [true, 'El perro es obligatorio'],
    },
    adoptante_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El adoptante es obligatorio'],
    },
    propietario_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El propietario es obligatorio'],
    },
    mensaje: {
      type: String,
      trim: true,
      default: '',
    },
    estado: {
      type: String,
      enum: {
        values: ['Pendiente', 'Aceptada', 'Rechazada'],
        message: 'El estado debe ser: Pendiente, Aceptada o Rechazada',
      },
      default: 'Pendiente',
    },
    respondido_en: {
      type: Date,
      default: null,
    },
  },
  {
    collection: 'solicitudes',
    versionKey: false,
    timestamps: { createdAt: 'creado_en', updatedAt: 'actualizado_en' },
  }
));