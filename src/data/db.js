import mongoose from "mongoose"; //sirve para operar con mongodb
import { Conversation } from "../models/conversation.model.js";

let conexion = null;

export const conexionBD = async () => { 
  try {
    if (conexion && mongoose.connection.readyState === 1) {
      console.log("Ya existe una conexión activa a MongoDB"); //Comprueba si ya existe una conexión activa
      return conexion;
    }

    conexion = await mongoose.connect(process.env.MONGODB_URI, { 
      dbName: "tfg",
      serverSelectionTimeoutMS: 30000,
    });

    // Sincronizar índices del modelo con la colección
    await Conversation.syncIndexes();

    console.log("Conexión exitosa a MongoDB");
    return conexion.connection;

  } catch (error) {
    console.error("Error al conectar a MongoDB:", error.message);
    throw new Error("No se pudo conectar a la base de datos");
  }
};
