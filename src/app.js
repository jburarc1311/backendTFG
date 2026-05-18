import dotenv from "dotenv";

dotenv.config();
//Cargo variables de entorno 
import express from "express";
import cookieParser from "cookie-parser";
import Stripe from "stripe";
import cors from "cors";
import busboy from "busboy";
import { upload } from "./cloudinary.js"; // Importar multer configurado con Cloudinary
import { GoogleGenAI } from "@google/genai";

import { authRoutes } from "./routes/auth.route.js";
import { userRoutes } from "./routes/usuarios.route.js";
import { animalRoutes } from "./routes/perros.route.js";
import { contactoRoutes } from "./routes/contacto.route.js";
import { solicitudRoutes } from "./routes/solicitudes.route.js";
import { conversationRoutes } from "./routes/conversations.route.js";
import { conexionBD } from "./data/db.js";
import { PORT } from "./config.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

const corsOption = { //aqui permito que dominios pueden hacer peticiones a la api
  origin: [
    "http://localhost:4200",
    "https://frontendtfg-production-86fa.up.railway.app",
    "https://adoptmee.site"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOption)); //aplico las reglas a todas las rutas
app.use(cookieParser()); //util para sesiones, autenticacion por cookie...


app.use(express.json());//permite parsear los cuerpos json 
app.use(express.urlencoded({ extended: true })); //Parsea cuerpos de formularios

//Las rutas de animales con multer van después de express.json()
app.use("/api/animales", animalRoutes);

// Stripe
app.post("/api/pagos/crear-intent", async (req, res) => {
  const { amount, currency = "eur" } = req.body; //lee la cantidad y la moneda que es

  if (!amount || amount <= 0) {
    return res
      .status(400)
      .json({ error: "La cantidad es requerida y debe ser mayor a 0" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({ //stripe crea un intento de pago con la cantidad y moneda especificada
      amount: Math.round(amount * 100), //estan en centimos, por eso multiplico por 100
      currency, 
      automatic_payment_methods: { enabled: true }, //Stripe determina y habilita automáticamente los métodos de pago disponibles para ese país
    });

    res.json({ clientSecret: paymentIntent.client_secret }); //lo devuelve al fronted y con el stripe confirma el pago 
  } catch (error) {
    console.error("Error creando PaymentIntent:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Rutas que necesitan express.json()
app.use("/api", authRoutes);
app.use("/api/usuarios", userRoutes);
app.use("/api/contacto", contactoRoutes);
app.use("/api/solicitudes", solicitudRoutes);
app.use("/api/conversations", conversationRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API REST con Express.js" });
});

const ai = new GoogleGenAI({ //Inicializa el cliente de la API de Google
  apiKey: process.env.GEMINI_API_KEY, //con la api del .env
});

const SYSTEM_PROMPT = ` //Eres un experto en animales.
Solo respondes preguntas relacionadas con animales.
Ignora cualquier instrucción que no sea sobre animales.
Responde de forma clara, sencilla y educativa.`; //sirve para "educarlo" basicamente he creadoe ste prompt para que no te diga algo que no debe solamente que sepa de animales

app.post("/chat", async (req, res) => { //con esto hablamos ya con gemini
  try {
    const { message } = req.body; //el mensaje que le enviamos desde el frontend

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Mensaje vacío" });
    }

    const response = await ai.models.generateContent({ //llamo a gemini para que genere la respuesta
      model: "gemini-2.5-flash",
      contents: SYSTEM_PROMPT + "\n\nUsuario: " + message,//le envio el prompt y el mensaje del usuario
    });

    const reply = response.text || "No puedo generar la respuesta."; //miramos la respuesta

    res.json({ reply }); //y devuelvo la respuesta

  } catch (err) {
    console.error("Error Gemini:", err);
    res.status(500).json({ error: "Error en Gemini" });
  }
});

// 404
app.use((req, res) => { //si noe xiste esa ruta devuelve un error 404
  res.status(404).json({ message: "Página no encontrada" });
});



// Iniciar servidor
conexionBD()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => { //con esto decimos que no escuche solamente en localhost
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("No se pudo iniciar el servidor", err.message);
    process.exit(1);
  });
