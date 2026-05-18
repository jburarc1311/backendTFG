import dotenv from "dotenv"; //carga variables
dotenv.config();

import { v2 as cloudinary } from "cloudinary"; //importo la libreria de Cloudinary 2 y la renombro como cloudinary para usar en el código
import { CloudinaryStorage } from "multer-storage-cloudinary"; //permite que el multer guarde directamnete en cloudinary
import multer from "multer"; //intercepta y gestiona archivos subidos desde formularios

// Configurar Cloudinary con credenciales del .env
cloudinary.config({ //sin esto cloudinary no sabria a que cuanta subir las cosas
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary configurado");

// Configurar almacenamiento en Cloudinary
const storage = new CloudinaryStorage({ //le digo al multer donde y como guardar los archivos
  cloudinary, 
  params: async (req, file) => { 
    return {
      folder: "adopt-me/animales", // Carpeta en Cloudinary
      format: "jpg", // Convertir a JPG automáticamente
      public_id: `animal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Nombre único
    };
  },
});

// Configurar multer con CloudinaryStorage
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
});

console.log("Multer configurado");

export { cloudinary, upload };
