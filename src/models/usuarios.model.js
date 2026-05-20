// models/Alumno.js
import mongoose from 'mongoose';

export const Usuario = mongoose.model('Usuario', new mongoose.Schema({

  name: { //atributo nombre
    type: String,
    required: [true, 'El nombre es requerido'],
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    maxlength: [100, 'El nombre debe tener como máximo 100 caracteres'],
    trim: true
  },
  email: { //atributo email
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Debe proporcionar un email válido']
  },
  descripcion: { //atributo descripcion
    type: String,
    required: [true, 'La descripción es requerida'],
    minlength: [10, 'La descripción debe tener al menos 10 caracteres'],
    maxlength: [255, 'La descripción debe tener como máximo 255 caracteres'],
    trim: true,
    default: ''
  },
  password: { //atributo password
    required: [true, 'La contraseña es requerida'],
    type: String,
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    maxlength: [255]
  },
  role: { //atributo role
    type: String,
    enum: {
      values: ['Admin', 'Usuario'],
      message: 'El rol debe ser: Admin o Usuario'
    },
    default: 'Usuario',
    required: true
  },
  active: { //atributo activo
    type: Boolean,
    default: false
  },
  photo:{  //atributo foto
    type: String, 
    default: '' 
  },
  ubicacion: { //atributo ubicacion
    type: String,
    default: ''
  },
  animales: { //atributo animales que tiene subidos
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: 'animales',
  },
  favoritos: { //atributo favoritos que tiene
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    ref: 'animales',
  },
  activationToken: { //atributo token de activación para email de activar cuenta
    type: String,
    default: null
  },
  activationTokenExpires: { //atributo fecha de expiración del token de activación
    type: Date,
    default: null
  },
  creado_en: { //atributo fecha de creación del usuario
    type: Date,
    default: Date.now
  },
  googleId: { //Es el ID que devuelve Google en un login OAuth. Se guarda para identificar usuarios que usan iniciar sesion con Google y evitar duplicados.
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