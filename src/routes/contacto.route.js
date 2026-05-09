import express from "express";
import { crearContacto, } from "../controllers/contacto.controller.js";

const router = express.Router();

router.post("/", crearContacto);



export { router as contactoRoutes };
