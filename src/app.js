import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

console.log("MONGODB_URI:", process.env.MONGODB_URI);

import express from "express";
import cookieParser from "cookie-parser";
import Stripe from "stripe";
import cors from "cors";
import busboy from "busboy";
import { upload } from "./cloudinary.js"; // Importar multer configurado con Cloudinary

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

const corsOption = {
  origin: [
    "http://localhost:4200",
    "https://frontend-4scyxus6k-jburarc1311s-projects.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOption));
app.options(cors(corsOption));
app.use(cookieParser());

// Middlewares de parseo para JSON y URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🚨 ORDEN CRÍTICO: Las rutas de animales CON MULTER van después de express.json()
// Multer puede procesar tanto multipart/form-data como JSON
app.use("/api/animales", animalRoutes);

// Ruta para crear el Payment Intent
app.post("/api/pagos/crear-intent", async (req, res) => {
  const { amount, currency = "eur" } = req.body;

  if (!amount || amount <= 0) {
    return res
      .status(400)
      .json({ error: "El monto es requerido y debe ser mayor a 0" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("❌ Error creando PaymentIntent:", error.message);
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

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Página no encontrada" });
});

// Iniciar servidor
conexionBD()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("No se pudo iniciar el servidor", err.message);
    process.exit(1);
  });
