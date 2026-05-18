// models/Solicitud.js
import mongoose from 'mongoose';

export const Solicitud = mongoose.model('Solicitud', new mongoose.Schema(
  {
    perro_id: { // atributo id del animal
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Perro',
      required: [true, 'El perro es obligatorio'],
    },
    adoptante_id: { // atributo id del adoptante (el que quiere al animal)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El adoptante es obligatorio'],
    },
    propietario_id: { // atributo id del propietario (dueño)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El propietario es obligatorio'],
    },
    mensaje: { // atributo mensaje al mandar la solicitud
      type: String,
      trim: true,
      default: '',
    },
    estado: { //los estados que va a estar la solicitud
      type: String,
      enum: {
        values: ['Pendiente', 'Aceptada', 'Rechazada'],
        message: 'El estado debe ser: Pendiente, Aceptada o Rechazada',
      },
      default: 'Pendiente',
    },
    respondido_en: { // atributo fecha de respuesta
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