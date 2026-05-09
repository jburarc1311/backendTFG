import express from "express";
import {
  addSolicitud,
  getSolicitudesEnviadas,
  getallSolicitudes,
  getSolicitudById,
  delSolicitud,
  getSolicitudesRecibidas,
  rechazarSolicitud,
  aceptarSolicitud
} from "../controllers/solicitud.controller.js";
import { autenticarToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", addSolicitud);
router.get("/enviadas", autenticarToken, getSolicitudesEnviadas);
router.get("/recibidas", autenticarToken, getSolicitudesRecibidas);
router.get("/:id", autenticarToken, getSolicitudById);
router.get("/", autenticarToken, getallSolicitudes);
router.delete("/:id", autenticarToken, delSolicitud);
router.put("/rechazar/:id", autenticarToken, rechazarSolicitud);
router.put("/aceptar/:id", autenticarToken, aceptarSolicitud);

export { router as solicitudRoutes };
