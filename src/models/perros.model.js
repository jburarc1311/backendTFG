// models/Perro.js
import mongoose from "mongoose";

export const Perro = mongoose.model(
  "Perro",
  new mongoose.Schema(
    {
      nombre: {
        type: String,
        required: [true, "El nombre del perro es obligatorio"],
        trim: true,
      },
      raza: {
        type: String,
        trim: true,
        default: "Desconocida",
      },
      edad: {
        type: Number, // en meses
        required: [true, "La edad es obligatoria"],
        min: [0, "La edad no puede ser negativa"],
        max: [20, "La edad no puede ser mayor a 20 años"],
      },
      tamano: {
        type: String,
        enum: {
          values: ["pequeño", "mediano", "grande"],
          message: "El tamano debe ser: pequeño, mediano o grande",
        },
        required: [true, "El tamano es obligatorio"],
      },
      sexo: {
        type: String,
        enum: {
          values: ["macho", "hembra"],
          message: "El sexo debe ser: macho o hembra",
        },
        required: [true, "El sexo es obligatorio"],
      },
      descripcion: {
        type: String,
        trim: true,
        default: "",
      },
      historia: {
        type: String,
        trim: true,
        default: "",
      },
      fotos: {
        type: [String], // array de URLs
        default: [],
      },
      vacunado: {
        type: Boolean,
        default: false,
      },
      esterilizado: {
        type: Boolean,
        default: false,
      },
      estado: {
        type: String,
        enum: {
          values: ["disponible", "en proceso", "adoptado"],
          message: "El estado debe ser: disponible, en proceso o adoptado",
        },
        default: "disponible",
      },
      megustas: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Usuario",
        default: [],
      },
      tipo: {
        type: String,
        required: [true, "El tipo de animal es obligatorio"],
      },
      propietario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: [true, "El propietario es obligatorio"],
      },
      ubicacion:{
        type:String,
        trim: true,
        default: "",
      },
      creado_en: {
        type: Date,
        default: Date.now,
      },
    },
    {
      collection: "animales",
      versionKey: false,
      timestamps: { createdAt: "creado_en", updatedAt: "actualizado_en" },
    },
  ),
);
