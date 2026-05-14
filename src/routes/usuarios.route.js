import express from "express";
import {
  getUsuarios,
  getUsuario,
  addUsuario,
  updateUsuario,
  delUsuario,
  updateAvatar,
  verFavoritos,
  misanimales,
  desactivarUsuario,
  activarUsuario,
} from "../controllers/usuarios.controller.js";
import { autenticarToken } from "../middlewares/auth.middleware.js";
import { upload } from "../cloudinary.js";

const router = express.Router();

router.get("/", getUsuarios);
router.post("/", addUsuario);
router.put(
  "/:id/avatar",
  autenticarToken,
  upload.single("avatar"),
  updateAvatar,
);
router.get("/favoritos/:id", verFavoritos);
router.get("/misanimales/:id", misanimales);
router.get("/:id", getUsuario);
router.put("/:id", updateUsuario);
router.delete("/:id", delUsuario);
router.put("/desactivar/:id", desactivarUsuario);
router.put("/activar/:id", activarUsuario);

export { router as userRoutes };
