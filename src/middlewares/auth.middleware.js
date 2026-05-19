import jwt from "jsonwebtoken"; // importa la librería jsonwebtoken se usa para crear, firmar y verificar JSON Web Tokens
import { SECRET_KEY, REFRESH_SECRET_KEY } from "../config.js";

// Tiempo de expiración de tokens
export const ACCESS_TOKEN_EXPIRY = "1m"; // 20 minutos
export const REFRESH_TOKEN_EXPIRY = "7d"; // 7 días

// Generar Access Token
export const generarAccessToken = (payload) => { // crea el token de acceso
  return jwt.sign(payload, SECRET_KEY, { expiresIn: ACCESS_TOKEN_EXPIRY });
}; //payload es el usuario y lo firma con la secret_key que expira en 20 minutos

// Generar Refresh Token
export const generarRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_SECRET_KEY, { // el usuario se firma con la REFRESH_SECRET_KEY
    expiresIn: REFRESH_TOKEN_EXPIRY, //sólo se usa para solicitar un nuevo access token
  });
};

// Verificar token
export const autenticarToken = (req, res, next) => { //el cliente envia el token y este lo valida para permitir el acceso a la ruta
  const authHeader = req.headers["authorization"]; //lee la cabezera

  console.log(
    " Authorization Header:",
    authHeader ? " Presente" : " No presente",
  );

  if (!authHeader) {
    console.log(" Token no proporcionado");
    return res.status(403).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1]; // extrae el token que esta en formato bearer

  if (!token) {
    console.log(" Token vacío o formato incorrecto");
    return res.status(403).json({ message: "Formato de token inválido" });
  }

  console.log(" Verificando token con SECRET_KEY...");

  jwt.verify(token, SECRET_KEY, (err, usuario) => { //verifico la firma y la expiración del token
    if (err) {
      console.log(" Token inválido o expirado:", err.message);
      return res
        .status(403)
        .json({ message: "Token invalido o expirado", error: err.message });
    }

    console.log(" Token verificado correctamente. Usuario:", usuario.id);
    req.user = usuario; //contiene el contenido del payload
    next();
  });
};

export const verificarRefreshToken = (token) => {
  try {
    // Verifica el token usando la clave secreta del refresh token
    const payload = jwt.verify(token, REFRESH_SECRET_KEY);
    return payload;
  } catch (error) {
    throw new Error("Refresh token inválido o expirado");
  }
};
//averiguar si está autorizado según el rol
export const autorizarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para acceder a esta ruta" });
    }
    next();
  };
};
      