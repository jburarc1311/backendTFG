import express from "express";
import {
  getAnimales,
  getAnimal,
  addAnimal,
  updateAnimal,
  delAnimal,
  darMegusta,
  quitarMegusta,
} from "../controllers/perros.controller.js";
// 📦 Importar el middleware 'upload' que está configurado en cloudinary.js
import { upload } from "../cloudinary.js";

const router = express.Router();

router.get("/", getAnimales);
router.get("/:id", getAnimal);

// POST: crear un nuevo animal con fotos
// upload.fields([{ name: "fotos", maxCount: 4 }])
// Esto permite a multer:
// 1. Capturar máximo 4 archivos del campo "fotos" → req.files.fotos = [array de archivos]
// 2. Procesar TODOS los campos de texto → req.body = { nombre, raza, tamano, sexo, ... }
router.post("/", upload.fields([{ name: "fotos", maxCount: 4 }]), addAnimal);
router.put("/:id", updateAnimal);
router.delete("/:id", delAnimal);
router.post("/megusta/:id", darMegusta);
router.delete("/megusta/:id", quitarMegusta);

export { router as animalRoutes };
