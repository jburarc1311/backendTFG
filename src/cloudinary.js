import dotenv from "dotenv";
dotenv.config(); // ✅ Asegurar que dotenv esté cargado AQUÍ también

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Configurar Cloudinary con credenciales del .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("☁️  Cloudinary configurado:");
console.log("   - Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log(
  "   - API Key:",
  process.env.CLOUDINARY_API_KEY ? "✓ Presente" : "✗ Falta"
);
console.log(
  "   - API Secret:",
  process.env.CLOUDINARY_API_SECRET ? "✓ Presente" : "✗ Falta"
);

// Configurar almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
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

console.log("✅ Multer configurado con CloudinaryStorage");

export { cloudinary, upload };
