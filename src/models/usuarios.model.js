// models/Alumno.js
import mongoose from 'mongoose';

export const Usuario = mongoose.model('Usuario', new mongoose.Schema({

  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    maxlength: [100, 'El nombre debe tener como máximo 100 caracteres'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Debe proporcionar un email válido']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    minlength: [10, 'La descripción debe tener al menos 10 caracteres'],
    maxlength: [255, 'La descripción debe tener como máximo 255 caracteres'],
    trim: true,
    default: ''
  },
  password: {
    type: String,
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    maxlength: [255]
  },
  role: {
    type: String,
    enum: {
      values: ['Admin', 'Usuario'],
      message: 'El rol debe ser: Admin o Usuario'
    },
    default: 'Usuario',
    required: true
  },
  active: {
    type: Boolean,
    default: false
  },
  photo:{ 
    type: String, 
    default: '' 
  },
  ubicacion: {
    type: String,
    default: ''
  },
  animales: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: 'animales',
  },
  favoritos: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    ref: 'animales',
  },
  activationToken: {
    type: String,
    default: null
  },
  activationTokenExpires: {
    type: Date,
    default: null
  },
  creado_en: {
    type: Date,
    default: Date.now
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true //permite que no falle si está vacío
  }
},
  {
    timestamps: false,
    collection: 'usuarios',
    versionKey: false
  }
));

