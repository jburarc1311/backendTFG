import bcrypt from "bcryptjs";
import { Usuario } from "../models/usuarios.model.js";
import { Perro } from "../models/perros.model.js";

export const getUsuarios = async (req, res) => { //devulve todos los usuarios
  try {
    console.log("pasa");
    const usuarios = await Usuario.find();

    res.status(200).json({ data: usuarios.length ? usuarios : [] });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener usuarios", error: error.message });
  }
};

export const getUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id).select("-password"); //excluy el campo password

    if (!usuario)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.status(200).json({ data: usuario });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener usuarios", error: error.message });
  }
};

export const addUsuario = async (req, res) => {
  try {
    const { name, email, descripcion, password, role, active, favoritos } =
      req.body;

    // Hashea la contraseña de forma segura
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);
    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      name,
      email,
      descripcion,
      password: hashPassword,
      role: role || "Usuario",
      active: active !== undefined ? active : false,
      favoritos: favoritos || [],
    });

    res.status(201).json({ id: nuevoUsuario._id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al insertar el usuario", error: error.message });
  }
};

export const updateUsuario = async (req, res) => {
  try {
    const { name, descripcion,ubicacion } = req.body;
    const { id } = req.params;

    // Verificar que el usuario existe
    const usuarioExist = await Usuario.findById(id);

    if (!usuarioExist) {
      return res
        .status(400)
        .json({ message: `El usuario "${idCurso}" no existe` });
    }

    const usuario = await Usuario.findByIdAndUpdate(
      id, //filtro
      { name, descripcion, ubicacion }, //datos a actualizar
      { new: true, runValidators: true },
    ); //devolver documento actualizado y aplica validaciones.

    res.status(200).json({ message: `Usuario actualizado ${usuario._id}  ` });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el usuario",
      error: error.message,
    });
  }
};

export const delUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    //Verificar que el usuario existe
    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    //Evitar que un usuario se elimine a sí mismo

    console.log(usuario);
    if (usuario._id === id) {
      return res.status(400).json({
        message: "No puedes eliminar tu propia cuenta",
      });
    }

    // Evitar eliminar al último 
    if (usuario.role === "Admin") {
      const totalAdmins = await User.countDocuments({ role: "Admin" });

      if (totalAdmins <= 1) {
        return res.status(400).json({
          message: "No se puede eliminar al último administrador del sistema",
        });
      }
    }

    await Usuario.findByIdAndDelete(id);

    res.status(200).json({ message: "Usuario borrado" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al borrar el Usuario", error: error.message });
  }
};

const generarPassword = async () => {
  // Genera un valor aleatorio seguro (8 caracteres hex)
  const random = crypto.randomBytes(4).toString("hex");
  // Hashea la contraseña de forma segura
  const saltRounds = 10;
  const hashPassword = await bcrypt.hash(pass, saltRounds);
  return hashPassword;
};

export const updateAvatar = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("\n========== SUBIENDO AVATAR ==========");
    console.log(" Usuario ID:", id);
    console.log("Archivo recibido:", req.file ? "SÍ" : "NO");

    if (req.file) {
      console.log("   - Nombre:", req.file.filename);
      console.log("   - Tamaño:", req.file.size, "bytes");
      console.log("   - Mimetype:", req.file.mimetype);
      console.log("   - Path Cloudinary:", req.file.path);
    }

    // Verificamos que multer haya procesado un archivo
    if (!req.file) {
      console.log("No se recibió archivo");
      return res
        .status(400)
        .json({ message: "No se ha subido ninguna imagen" });
    }

    const photoUrl = req.file.path;
    console.log("URL a guardar:", photoUrl);

    // Buscamos al usuario por ID en MongoDB
    console.log("Buscando usuario en MongoDB...");
    const usuario = await Usuario.findByIdAndUpdate(
      id,
      { photo: photoUrl },
      { new: true },
    );

    if (!usuario) {
      console.log("Usuario no encontrado:", id);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    console.log("Usuario actualizado correctamente");
    console.log("URL guardada en BD:", usuario.photo);
    console.log("=========== FIN SUBIDA ==========\n");

    res.status(200).json({
      message: "Foto actualizada correctamente",
      photo: usuario.photo,
      usuario: usuario,
    });
  } catch (error) {
    console.log("ERROR EN UPDATEAVATAR:");
    console.log("Mensaje:", error.message);
    console.log("Stack:", error.stack);
    console.log("=========== FIN ERROR ==========\n");

    res.status(500).json({
      message: "Error al subir la imagen",
      error: error.message,
    });
  }
};

// ```

// El flujo completo es:
// ```
// Cliente manda imagen
//        ↓
// multer intercepta la petición
//        ↓
// multer-storage-cloudinary sube la imagen a Cloudinary
//        ↓
// Cloudinary devuelve la URL pública → se guarda en req.file.path
//        ↓
// updateAvatar guarda esa URL en MongoDB (campo photo del usuario)
//        ↓
// Devuelve la URL al frontend para mostrarla en el navbar





export const verFavoritos = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id);
    const favoritos = usuario.favoritos || [];
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({
      message: "Favoritos obtenidos correctamente",
      favoritos: favoritos,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los favoritos",
      error: error.message,
    });
  }
};

export const misanimales = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Obtener todos los perros del usuario filtrando por propietario_id
    const misAnimales = await Perro.find({ propietario_id: id });

    res.status(200).json({
      message: "Animales obtenidos correctamente",
      animales: misAnimales,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener los animales", error: error.message });
  }
};

export const desactivarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json({
      message: "Usuario desactivado correctamente",
      usuario: usuario,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al desactivar el usuario",
      error: error.message,
    });
  }
};

export const activarUsuario = async (req, res) => {
  try {
    const { id } = req.params;  
    const usuario = await Usuario.findByIdAndUpdate(
      id,
      { active: true },
      { new: true }
    );
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json({
      message: "Usuario activado correctamente",
      usuario: usuario,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al activar el usuario",
      error: error.message,
    });
  }
};
