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

// GET: obtener todos los animales
router.get("/", getAnimales);

// GET: obtener un animal por ID
router.get("/:id", getAnimal);

// POST: crear un nuevo animal con fotos
// 📸 upload.fields([{ name: "fotos", maxCount: 4 }])
// Esto permite a multer:
// 1. Capturar máximo 4 archivos del campo "fotos" → req.files.fotos = [array de archivos]
// 2. Procesar TODOS los campos de texto → req.body = { nombre, raza, tamano, sexo, ... }
router.post("/", upload.fields([{ name: "fotos", maxCount: 4 }]), addAnimal);

// PUT: actualizar un animal
router.put("/:id", updateAnimal);

// DELETE: eliminar un animal
router.delete("/:id", delAnimal);

// POST: dar me gusta a un animal
router.post("/megusta/:id", darMegusta);

// DELETE: quitar me gusta a un animal
router.delete("/megusta/:id", quitarMegusta);

export { router as animalRoutes };
