import { Router } from 'express';

import {register, login, refreshToken, activaCuenta} from '../controllers/auth.controller.js';
import { validarRegistro, validarLogin} from '../validators/usuarios.validator.js';


const router = Router()

// Rutas públicas (sin autenticación)
router.post('/register', validarRegistro, register);
router.post('/login', validarLogin, login);
router.get('/auth/activate/:token', activaCuenta);
router.post('/refresh-token', refreshToken);



export { router as authRoutes };
