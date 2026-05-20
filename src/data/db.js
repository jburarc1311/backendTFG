import mongoose from "mongoose"; //sirve para operar con mongodb
import { Conversation } from "../models/conversation.model.js";

let conexion = null;

const limpiarIndicesAntiguosConversaciones = async () => {
  const collection = mongoose.connection.db.collection("conversations");
  const indicesLegacy = ["participants_1", "participant1_1_participant2_1"];

  for (const nombreIndice of indicesLegacy) {
    try {
      await collection.dropIndex(nombreIndice);
      console.log(`Índice legacy ${nombreIndice} eliminado`);
    } catch (error) {
      const indiceNoExiste = error?.code === 27 || /index not found/i.test(error?.message || "");
      if (!indiceNoExiste) throw error;
    }
  }

  await Conversation.syncIndexes();
  console.log("Índices de conversations sincronizados");
};

export const conexionBD = async () => { //permite la conexión a la base de datos
  try {
    if (conexion && mongoose.connection.readyState === 1) {
      console.log("Ya existe una conexión activa a MongoDB"); //Comprueba si ya existe una conexión activa
      return conexion;
    }

    conexion = await mongoose.connect(process.env.MONGODB_URI, { //Llama a Mongoose para crear una nueva conexión con la URI de mongodb
      dbName: "tfg",
      serverSelectionTimeoutMS: 30000,
    });

    await limpiarIndicesAntiguosConversaciones();

    console.log("Conexión exitosa a MongoDB");
    return conexion.connection;

  } catch (error) {
    console.error("Error al conectar a MongoDB:", error.message);
    throw new Error("No se pudo conectar a la base de datos");
  }
};
