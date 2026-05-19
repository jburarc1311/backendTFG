import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Usuario } from "../models/usuarios.model.js";
import {
  generarAccessToken,
  generarRefreshToken,
  verificarRefreshToken,
} from "../middlewares/auth.middleware.js";
import {enviarEmailContacto,enviaremailActivacion,} from "../services/resend.js";
import client from '../config/google.js';
import jwt from 'jsonwebtoken';

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/api",
});

// registro de nuevo usuario
export const register = async (req, res) => {
  try {
    const { name, email, password, descripcion, ubicacion } = req.body;

    // Hashea la contraseña de forma segura
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);

    // Generar token de activación
    const activationToken = crypto.randomBytes(32).toString("hex");
    const activationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Crear nuevo usuario
    const nuevoUsuario = await Usuario.create({
      name,
      email,
      password: hashPassword,
      descripcion,
      ubicacion,
      role: "Usuario",
      active: false,
      activationToken,
      activationTokenExpires,
    });

    // Enviar email de activaciónv
    const urlActivacion = `${process.env.URL}/api/auth/activate/${activationToken}`; // endpoint de activación
    const htmlContent = contenidoHTML(email, name, urlActivacion); //html del correo

    try {
      await enviaremailActivacion(email, urlActivacion, name);
      console.log("Email enviado correctamente");
    } catch (err) {
      console.log("Error enviando email:", err.message);
    }

    // Preparar payload para los tokens sin contraseña
    const payload = {
      id: nuevoUsuario._id,
      email: nuevoUsuario.email,
      role: nuevoUsuario.role,
    };

    // Generar tokens
    const accessToken = generarAccessToken(payload);
    const refreshToken = generarRefreshToken(payload);

    // Guardar refresh token en el navegador junto con la respuesta Http
    res.cookie("refreshToken", refreshToken, refreshCookieOptions());

    res.status(201).json({
      message:
        "Usuario registrado exitosamente. Por favor, revisa tu email para activar tu cuenta.   ",
      data: { id: nuevoUsuario._id, accessToken },
    });
  } catch (error) {
    console.error("Error en registro:", error);
    console.error("Detalles del error:", error.message);

    // Error de duplicado (email único)
    if (error.code === 11000) {
      return res.status(400).json({
        message: "El email ya está registrado",
      });
    }

    // Error de validación de Mongoose
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Error de validación",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    // Error general
    res.status(500).json({
      message: "Error al registrar usuario",
      error: error.message,
    });
  }
};

// LOGIN de usuario existente
export const login = async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ email: req.body.email });
    //vemos si esta creado el usuario
    if (!usuario) {
      return res.status(401).json({ message: "No existe usuario" });
    }

    const validPass = await bcrypt.compare(req.body.password, usuario.password);
    //comprobamos la contraseña
    if (!validPass) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    //se crea el payload
    const payload = {
      id: usuario._id,
      email: usuario.email,
      role: usuario.role,
    };

    const accessToken = generarAccessToken(payload); //genera el token de acceso (para las rutas protegidas)
    const refreshToken = generarRefreshToken(payload); //para pedir un nuevo access token cuando se vaya

    res.cookie("refreshToken", refreshToken, refreshCookieOptions());

    return res.json({
      message: "Login correcto",
      data: {
        accessToken,
        user: {
          id: usuario._id,
          name: usuario.name,
          email: usuario.email,
          role: usuario.role,
          photo: usuario.photo,
          ubicacion: usuario.ubicacion,
        },
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};

// REFRESH TOKEN - Renovar access token
export const refreshToken = async (req, res) => {
  try {
    //se recupera el resfreshToken de la petición
    const token = req.cookies.refreshToken;

    if (!token)
      return res
        .status(401)
        .json({ message: "Refresh token no proporcionado" });

    const payload = verificarRefreshToken(token); //función de JWT

    if (!payload)
      return res
        .status(401)
        .json({ message: "Refresh token inválido o expirado" });

    // Buscar usuario en la base de datos

    const usuario = await Usuario.findById(payload.id);

    if (!usuario)
      return res.status(404).json({ message: "Usuario no encontrado" });
    if (!usuario.active)
      return res.status(403).json({ message: "Usuario inactivo" });

    // quitar el ataributo iat la fehca uqe se creo el token y exp la fecha que se va el token
    const { iat, exp, ...payloadBis } = payload;
    // Generar nuevos tokens

    const nuevoAccessToken = generarAccessToken(payloadBis);
    console.log("pasa");
    const nuevoRefreshToken = generarRefreshToken(payloadBis);

    // Guardar refresh token en el navegador junto con la respuesta Http
    res.cookie("refreshToken", nuevoRefreshToken, refreshCookieOptions());
    res.status(200).json({
      message: "Token renovado exitosamente",
      accessToken: nuevoAccessToken,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al renovar token",
    });
  }
};

// construir el HTML del email de activación
const contenidoHTML = (email, name, urlActivacion) => {
  return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .button { 
                        display: inline-block; 
                        padding: 12px 30px; 
                        background-color: #4CAF50; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        margin: 20px 0;
                    }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>¡Bienvenido/a ${name}!</h1>
                    </div>
                    <div class="content">
                        <p>Gracias por registrarte en nuestra plataforma.</p>
                        <p>Para completar tu registro y activar tu cuenta, haz clic en el siguiente botón:</p>
                        <div style="text-align: center;">
                            <a href="${urlActivacion}" class="button">Activar mi cuenta</a>
                        </div>
                        <p><strong>Este enlace expirará en 24 horas.</strong></p>
                       
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Tu App. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
};

export const activaCuenta = async (req, res) => {
  try {
    const { token } = req.params;

    // Buscar usuario con el token de activación
    const usuario = await Usuario.findOne({
      activationToken: token,
      activationTokenExpires: { $gt: new Date() },
    });

    if (!usuario) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error de Activación</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
            h1 { color: #d32f2f; }
            p { color: #666; line-height: 1.6; }
            a { display: inline-block; margin-top: 20px; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Error de Activación</h1>
            <p>El enlace de activación es inválido o ha expirado.</p>
            <p>Por favor, intenta registrarte de nuevo.</p>
            <a href="https://adoptmee.site/login">Volver al Registro</a>
          </div>
        </body>
        </html>
      `);
    }

    // Activar cuenta
    usuario.active = true;
    usuario.activationToken = null;
    usuario.activationTokenExpires = null;
    await usuario.save();

    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cuenta Activada</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
          .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
          h1 { color: #4CAF50; }
          p { color: #666; line-height: 1.6; }
          a { display: inline-block; margin-top: 20px; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>¡Cuenta Activada!</h1>
          <p>Tu cuenta ha sido activada correctamente.</p>
          <p>Ya puedes iniciar sesión en la plataforma.</p>
          <a href="https://adoptmee.site/login">Ir al Login</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error al activar cuenta:", error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
          .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
          h1 { color: #d32f2f; }
          p { color: #666; line-height: 1.6; }
          a { display: inline-block; margin-top: 20px; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Error</h1>
          <p>Hubo un error al activar tu cuenta.</p>
          <p>Por favor, intenta más tarde.</p>
          <a href="https://adoptmee.site/login">Volver al Inicio</a>
        </div>
      </body>
      </html>
    `);
  }
};


export const googleLogin = async (req, res) => {

  try {

    const { token } = req.body; // el token de Google que envía el frontend

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload(); // obtiene la informacion del token

    const { sub, email, name, picture } = payload; // Extrae datos del usuario de Google

    // buscar usuario
    let user = await Usuario.findOne({ email }); // Busca si ya existe un usuario con ese email 

    // crear si no existe
    if (!user) { // si no existe lo crea con los datos de Google
      return res.status(404).json({
        ok: false,
        msg: 'El usuario no está registrado. Debe registrarse primero.',
      });
    }

    // crear JWT propio
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: '7d' }
    );

    return res.json({
      ok: true,
      token: jwtToken,
      user
    }); // devolvemos al front el token

  } catch (error) {
    console.log(error);
    return res.status(401).json({
      ok: false,
      msg: 'Token inválido'
    });
  }
};