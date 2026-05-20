import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Perro } from "../models/perros.model.js";
import { Usuario } from "../models/usuarios.model.js";

export const getAnimales = async (req, res) => {
  //nos devuelve todos los animales
  try {
    const perros = await Perro.find().sort({ nombre: 1 }); //orden ascendente -1 descendente

    res.status(200).json({ data: perros.length ? perros : [] }); // nos devuelve el array
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener animales", error: error.message });
  }
};

export const getAnimal = async (req, res) => {
  // nos devuelve un animal por el id
  try {
    const { id } = req.params; //leemos el id
    const perro = await Perro.findById(id); //buscamos por el id

    if (!perro)
      return res.status(404).json({ message: "Animal no encontrado" });

    res.status(200).json({ data: perro }); // nos lo devuelve
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener el animal", error: error.message });
  }
};

export const addAnimal = async (req, res) => {
  //añadimos el animal
  try {
    console.log("req.body recibido:", req.body); //lo pasamos todo por body

    const {
      nombre,
      raza,
      edad,
      tamano,
      sexo,
      descripcion,
      historia,
      vacunado,
      esterilizado,
      estado,
      tipo,
      propietario_id,
      megustas,
    } = req.body;

    const propietario =
      await Usuario.findById(propietario_id).select("ubicacion"); //le cogemos la ubi del usuario para guardarla en el animal

    if (!propietario) {
      return res.status(404).json({ message: "Propietario no encontrado" });
    }

    // Obtener URLs de fotos desde Cloudinary
    // Con upload.fields(), los archivos están en req.files.fotos
    // Cloudinary procesa cada archivo y devuelve .path (URL pública)
    // Ejemplo: "https://res.cloudinary.com/dsqu3qet6/image/upload/v1776234323/adopt-me/animales/..."
    const fotos =
      req.files && req.files.fotos
        ? req.files.fotos.map((file) => {
            // Cloudinary devuelve .path con la URL pública completa
            return file.path;
          })
        : [];

    console.log("Datos recibidos:", { nombre, raza, edad, tamano, sexo });
    console.log("Fotos capturadas:", fotos.length);
    console.log("URLs de Cloudinary:", fotos);

    if (!Array.isArray(fotos) || fotos.length < 1 || fotos.length > 5) {
      return res.status(400).json({
        message: `Se requieren entre 1 y 5 fotos. Se recibieron: ${fotos ? fotos.length : 0}`,
      });
    }

    // 📝 Convertir strings a booleanos (FormData envía todo como string)
    const vacunadoBoolean = vacunado === "true" || vacunado === true;
    const esterilizadoBoolean =
      esterilizado === "true" || esterilizado === true;

    // Crear el documento en MongoDB
    const nuevoAnimal = await Perro.create({
      nombre,
      raza,
      edad: Number(edad),
      tamano: tamano,
      sexo,
      descripcion,
      historia,
      fotos,
      vacunado: vacunadoBoolean,
      esterilizado: esterilizadoBoolean,
      estado: estado || "disponible",
      propietario_id,
      tipo,
      megustas: [],
      ubicacion: propietario.ubicacion || "",
    });

    // Responder con el ID del animal creado
    res.status(201).json({ id: nuevoAnimal._id });
  } catch (error) {
    console.error("Error en addAnimal:", error);
    res.status(500).json({
      message: "Error al insertar el Animal",
      error: error.message,
    });
  }
};

export const updateAnimal = async (req, res) => {
  //actualizamos el animal
  try {
    const {
      nombre,
      raza,
      edad,
      tamano,
      sexo,
      descripcion,
      historia,
      fotos,
      vacunado,
      esterilizado,
      estado,
      tipo,
      propietario_id,
      ubicacion,
      creado_en,
    } = req.body;

    // Si se envían fotos en la actualización, validar que haya entre 1 y 5
    if (
      fotos &&
      (!Array.isArray(fotos) || fotos.length < 1 || fotos.length > 5)
    ) {
      return res.status(400).json({
        message: `Si se envía 'fotos', se requieren entre 1 y 5 fotos. Se recibieron: ${Array.isArray(fotos) ? fotos.length : "no válido"}`,
      });
    }
    const { id } = req.params;

    // Verificar que el usuario existe
    const animalExist = await Perro.findById(id);

    if (!animalExist) {
      return res.status(400).json({ message: `El animal "${id}" no existe` });
    }

    const animal = await Perro.findByIdAndUpdate(
      id, //filtro
      {
        nombre,
        raza,
        edad,
        tamano,
        sexo,
        descripcion,
        historia,
        fotos,
        vacunado,
        esterilizado,
        estado,
        ubicacion: ubicacion || "",
      }, //datos a actualizar
      { returnDocument: "after", runValidators: true },
    ); //devolver documento actualizado y aplica validaciones.

    res
      .status(200)
      .json({ message: `Animal actualizado ${animalExist._id}  ` });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el usuario",
      error: error.message,
    });
  }
};

export const delAnimal = async (req, res) => {
  //eliminar un animal por su id
  try {
    const { id } = req.params;
    // 1. Verificar que el usuario existe
    const animal = await Perro.findById(id);

    if (!animal) {
      return res.status(404).json({ message: "Animal no encontrado" });
    }
    // 2. Evitar que un usuario se elimine a sí mismo (opcional)

    console.log(animal);

    await Perro.findByIdAndDelete(id); // se elimina

    res.status(200).json({ message: "Animal borrado" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al borrar el Animal", error: error.message });
  }
};

export const darMegusta = async (req, res) => {
  //damos me gusta al animal
  try {
    const { id } = req.params; // pillamos el id del animal
    const { usuario_id } = req.body; // y el del usuario

    if (!usuario_id) {
      return res.status(400).json({ message: "usuario_id es requerido" });
    }

    const perro = await Perro.findById(id); //busca el animal
    const usuario = await Usuario.findById(usuario_id); //y el usuario

    if (!perro)
      return res.status(404).json({ message: "Animal no encontrado" });

    if (!usuario)
      return res.status(404).json({ message: "Usuario no encontrado" });

    // Convertir a ObjectId
    const usuarioObjectId = new mongoose.Types.ObjectId(usuario_id);
    const animalObjectId = new mongoose.Types.ObjectId(id);

    if (perro.megustas.includes(usuarioObjectId)) {
      return res
        .status(400)
        .json({ message: "Ya has dado me gusta a este animal" });
    }

    // Actualizar el animal: añadir usuario a megustas
    const animalActualizado = await Perro.findByIdAndUpdate(
      id,
      { $push: { megustas: usuarioObjectId } },
      { returnDocument: "after", runValidators: false }, // devulve el documento actualizado y no aplica validaciones
    );

    // Actualizar el usuario: añadir animal a favoritos
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      usuario_id,
      { $push: { favoritos: animalObjectId } },
      { returnDocument: "after", runValidators: false }, // devulve el documento actualizado y no aplica validaciones
    );

    res.status(200).json({
      message: "Me gusta añadido correctamente",
      data: { animal: animalActualizado, usuario: usuarioActualizado },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al dar me gusta al animal",
        error: error.message,
      });
  }
};

export const quitarMegusta = async (req, res) => {
  // para quitar el me gusta
  try {
    const { id } = req.params; // pillamos el id del animal
    const { usuario_id } = req.body; // y el de usuario

    if (!usuario_id) {
      return res.status(400).json({ message: "usuario_id es requerido" });
    }

    const perro = await Perro.findById(id); //busca el animal
    const usuario = await Usuario.findById(usuario_id);

    if (!perro)
      return res.status(404).json({ message: "Animal no encontrado" });

    if (!usuario)
      return res.status(404).json({ message: "Usuario no encontrado" });

    // Convertir a ObjectId
    const usuarioObjectId = new mongoose.Types.ObjectId(usuario_id);
    const animalObjectId = new mongoose.Types.ObjectId(id);

    // Actualizar el animal: quitar usuario de megustas
    const animalActualizado = await Perro.findByIdAndUpdate(
      id,
      { $pull: { megustas: usuarioObjectId } },
      { returnDocument: "after", runValidators: false }, // devulve el documento actualizado y no aplica validaciones
    );

    // Actualizar el usuario: quitar animal de favoritos
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      usuario_id,
      { $pull: { favoritos: animalObjectId } },
      { returnDocument: "after", runValidators: false }, // devulve el documento actualizado y no aplica validaciones
    );

    res.status(200).json({
      message: "Me gusta removido correctamente",
      data: { animal: animalActualizado, usuario: usuarioActualizado },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al quitar me gusta del animal",
        error: error.message,
      });
  }
};
