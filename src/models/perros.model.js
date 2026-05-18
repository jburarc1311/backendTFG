// models/Perro.js
import mongoose from "mongoose";

export const Perro = mongoose.model(
  "Perro",
  new mongoose.Schema(
    {
      nombre: { // nombre del animal
        type: String,
        required: [true, "El nombre del perro es obligatorio"],
        trim: true,
      },
      raza: { // raza del animal
        type: String,
        trim: true,
        default: "Desconocida",
      },
      edad: { // edad del animal
        type: Number, // en meses
        required: [true, "La edad es obligatoria"],
        min: [0, "La edad no puede ser negativa"],
        max: [20, "La edad no puede ser mayor a 20 años"],
      },
      tamano: { // tamaño del animal
        type: String,
        enum: {
          values: ["pequeño", "mediano", "grande"],
          message: "El tamano debe ser: pequeño, mediano o grande",
        },
        required: [true, "El tamano es obligatorio"],
      }, 
      sexo: { //sexo del animal
        type: String,
        enum: {
          values: ["macho", "hembra"],
          message: "El sexo debe ser: macho o hembra",
        },
        required: [true, "El sexo es obligatorio"],
      },
      descripcion: { // descripcion del animal
        type: String,
        trim: true,
        default: "",
      },
      historia: { // historia del animal
        type: String,
        trim: true,
        default: "",
      }, 
      fotos: { // fotos del animal
        type: [String], // array de URLs
        default: [],
      },
      vacunado: { // atributo vacunado
        type: Boolean,
        default: false,
      },
      esterilizado: { // atributo esterilizado
        type: Boolean,
        default: false,
      },
      estado: { // estado del animal
        type: String,
        enum: {
          values: ["disponible", "en proceso", "adoptado"],
          message: "El estado debe ser: disponible, en proceso o adoptado",
        },
        default: "disponible",
      },
      megustas: { // cantidad de megustas del animal
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Usuario",
        default: [],
      },
      tipo: { //ripo del animal
        type: String,
        required: [true, "El tipo de animal es obligatorio"],
      },
      propietario_id: { // propietario del animal
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: [true, "El propietario es obligatorio"],
      },
      ubicacion:{ //ubicacion del animal
        type:String,
        trim: true,
        default: "",
      },
      creado_en: { // fecha de creación del animal
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
