import bcrypt from "bcryptjs";
import { Solicitud } from "../models/solicitud.model.js";
import { Usuario } from "../models/usuarios.model.js";
import { Perro } from "../models/perros.model.js";
import { enviarEmailSolicitud } from "../services/resend.js";

// CREAR solicitud de adopción
export const addSolicitud = async (req, res) => {
  try {
    const { perro_id, adoptante_id, propietario_id, mensaje } = req.body;

    // Validación: campos requeridos
    if (!perro_id || !adoptante_id || !propietario_id) {
      return res.status(400).json({
        message:
          "Los campos perro_id, adoptante_id y propietario_id son requeridos",
      });
    }

    // Verificar que el perro existe
    const perro = await Perro.findById(perro_id);
    if (!perro) {
      return res.status(404).json({
        message: "El perro no existe",
      });
    }

    // Verificar que el adoptante existe
    const adoptante = await Usuario.findById(adoptante_id);
    if (!adoptante) {
      return res.status(404).json({
        message: "El adoptante no existe",
      });
    }

    // Verificar que el propietario existe
    const propietario = await Usuario.findById(propietario_id);
    if (!propietario) {
      return res.status(404).json({
        message: "El propietario no existe",
      });
    }

    // Crear la solicitud
    const nuevaSolicitud = await Solicitud.create({
      perro_id,
      adoptante_id,
      propietario_id,
      mensaje: mensaje || "",
    });

    // Enviar email al propietario notificando la nueva solicitud
    try {
      await enviarEmailSolicitud({
        propietario: propietario.name,
        adoptante: `${adoptante.name} (${adoptante.email})`,
        perro: perro.nombre,
        mensaje,
        emailDestino: propietario.email,
      });
      console.log("✅ Email de notificación enviado al propietario");
    } catch (emailError) {
      console.warn(
        "⚠️ Error al enviar email, pero la solicitud se creó:",
        emailError.message,
      );
    }

    res.status(201).json({
      message: "Solicitud de adopción creada exitosamente",
      data: nuevaSolicitud,
    });
  } catch (error) {
    console.error("❌ Error al crear solicitud:", error);
    res.status(500).json({
      message: "Error al crear la solicitud",
      error: error.message,
    });
  }
};

export const getSolicitudesEnviadas = async (req, res) => {
  try {
    // Obtener adoptante_id del token autenticado
    const adoptante_id = req.user.id;

    // Obtener solicitudes enviadas por el adoptante
    const solicitudesEnviadas = await Solicitud.find({ adoptante_id });

    res.status(200).json({
      message: "Solicitudes obtenidas exitosamente",
      data: solicitudesEnviadas,
    });
  } catch (error) {
    console.error("❌ Error al obtener solicitudes:", error);
    res.status(500).json({
      message: "Error al obtener las solicitudes",
      error: error.message,
    });
  }
};

export const getSolicitudesRecibidas = async (req, res) => {
  try {
    // Obtener propietario_id del token autenticado
    const propietario_id = req.user.id;
    // Obtener solicitudes recibidas por el propietario
    const solicitudesRecibidas = await Solicitud.find({ propietario_id });
    res.status(200).json({
      message: "Solicitudes obtenidas exitosamente",
      data: solicitudesRecibidas,
    });
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    res.status(500).json({
      message: "Error al obtener las solicitudes",
      error: error.message,
    });
  }
};
export const getallSolicitudes = async (req, res) => {
  try {
    const solicitudes = await Solicitud.find();

    res.status(200).json({
      message: "Solicitudes obtenidas exitosamente",
      data: solicitudes,
    });
  } catch (error) {
    console.error("❌ Error al obtener solicitudes:", error);
    res.status(500).json({
      message: "Error al obtener las solicitudes",
      error: error.message,
    });
  }
};

export const getSolicitudById = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = await Solicitud.findById(id);

    if (!solicitud) {
      return res.status(404).json({
        message: "Solicitud no encontrada",
      });
    }

    res.status(200).json({
      message: "Solicitud obtenida exitosamente",
      data: solicitud,
    });
  } catch (error) {
    console.error("❌ Error al obtener solicitud:", error);
    res.status(500).json({
      message: "Error al obtener la solicitud",
      error: error.message,
    });
  }
};

export const delSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitudEliminada = await Solicitud.findByIdAndDelete(id);

    if (!solicitudEliminada) {
      return res.status(404).json({
        message: "Solicitud no encontrada",
      });
    }

    res.status(200).json({
      message: "Solicitud eliminada exitosamente",
      data: solicitudEliminada,
    });
  } catch (error) {
    console.error("❌ Error al eliminar solicitud:", error);
    res.status(500).json({
      message: "Error al eliminar la solicitud",
      error: error.message,
    });
  }
};

export const rechazarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitudRechazada = await Solicitud.findByIdAndUpdate(
      id,
      { estado: "Rechazada" },
      { new: true },
    );

    if (!solicitudRechazada) {
      return res.status(404).json({
        message: "Solicitud no encontrada",
      });
    }

    res.status(200).json({
      message: "Solicitud rechazada exitosamente",
      data: solicitudRechazada,
    });
  } catch (error) {
    console.error("Error al rechazar solicitud:", error);
    res.status(500).json({
      message: "Error al rechazar la solicitud",
      error: error.message,
    });
  }
};

export const aceptarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;

    const solicitud = await Solicitud.findById(id);
    if (!solicitud) {
      return res.status(404).json({
        message: "Solicitud no encontrada",
      });
    }

    const perroActualizado = await Perro.findByIdAndUpdate(
      solicitud.perro_id,
      { estado: "adoptado" },
      { new: true, runValidators: true },
    );

    if (!perroActualizado) {
      return res.status(404).json({
        message: "Perro no encontrado",
      });
    }

    const solicitudAceptada = await Solicitud.findByIdAndUpdate(
      id,
      { estado: "Aceptada" },
      { new: true },
    );

    res.status(200).json({
      message: "Solicitud aceptada exitosamente",
      data: {
        solicitud: solicitudAceptada,
        perro: perroActualizado,
      },
    });
  } catch (error) {
    console.error("Error al aceptar solicitud:", error);
    res.status(500).json({
      message: "Error al aceptar la solicitud",
      error: error.message,
    });
  }
};
