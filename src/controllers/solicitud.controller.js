import bcrypt from 'bcryptjs'
import { Solicitud } from '../models/solicitud.model.js';
import { Usuario } from '../models/usuarios.model.js';
import { Perro } from '../models/perros.model.js';
import { enviarEmailContacto } from '../services/resend.js';

// CREAR solicitud de adopción
export const addSolicitud = async (req, res) => {
  try {
    const { perro_id, adoptante_id, propietario_id, mensaje } = req.body;

    // Validación: campos requeridos
    if (!perro_id || !adoptante_id || !propietario_id) {
      return res.status(400).json({
        message: 'Los campos perro_id, adoptante_id y propietario_id son requeridos'
      });
    }

    // Verificar que el perro existe
    const perro = await Perro.findById(perro_id);
    if (!perro) {
      return res.status(404).json({
        message: 'El perro no existe'
      });
    }

    // Verificar que el adoptante existe
    const adoptante = await Usuario.findById(adoptante_id);
    if (!adoptante) {
      return res.status(404).json({
        message: 'El adoptante no existe'
      });
    }

    // Verificar que el propietario existe
    const propietario = await Usuario.findById(propietario_id);
    if (!propietario) {
      return res.status(404).json({
        message: 'El propietario no existe'
      });
    }

    // Crear la solicitud
    const nuevaSolicitud = await Solicitud.create({
      perro_id,
      adoptante_id,
      propietario_id,
      mensaje: mensaje || ''
    });

    // Enviar email al propietario notificando la nueva solicitud
    const emailPropietario = propietario.email;
    const asunto = `Nueva solicitud de adopción para ${perro.nombre}`;
    const htmlContent = `
      <h2>Nueva solicitud de adopción</h2>
      <p><strong>Adoptante:</strong> ${adoptante.name}</p>
      <p><strong>Email:</strong> ${adoptante.email}</p>
      <p><strong>Perro:</strong> ${perro.nombre}</p>
      <p><strong>Mensaje:</strong> ${mensaje || '(Sin mensaje)'}</p>
      <p>Por favor, revisa esta solicitud en tu panel.</p>
    `;

    try {
      await enviarEmailContacto({ nombre: propietario.name, motivo: asunto, mensaje: htmlContent });
      console.log('✅ Email de notificación enviado al propietario');
    } catch (emailError) {
      console.warn('⚠️ Error al enviar email, pero la solicitud se creó:', emailError.message);
    }

    res.status(201).json({
      message: 'Solicitud de adopción creada exitosamente',
      data: nuevaSolicitud
    });

  } catch (error) {
    console.error('❌ Error al crear solicitud:', error);
    res.status(500).json({
      message: 'Error al crear la solicitud',
      error: error.message
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
      message: 'Solicitudes obtenidas exitosamente',
      data: solicitudesEnviadas
    });
  } catch (error) {
    console.error('❌ Error al obtener solicitudes:', error);
    res.status(500).json({
      message: 'Error al obtener las solicitudes',
      error: error.message
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
      message: 'Solicitudes obtenidas exitosamente',
      data: solicitudesRecibidas
    });
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ 
      message: 'Error al obtener las solicitudes',
      error: error.message
    });
  }
};
export const getallSolicitudes = async (req, res) => {
  try {
    const solicitudes = await Solicitud.find();

    res.status(200).json({
      message: 'Solicitudes obtenidas exitosamente',
      data: solicitudes
    });
  } catch (error) {
    console.error('❌ Error al obtener solicitudes:', error);
    res.status(500).json({
      message: 'Error al obtener las solicitudes',
      error: error.message
    });
  }
};

export const getSolicitudById = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = await Solicitud.findById(id);

    if (!solicitud) {
      return res.status(404).json({
        message: 'Solicitud no encontrada'
      });
    }

    res.status(200).json({
      message: 'Solicitud obtenida exitosamente',
      data: solicitud
    });
  } catch (error) {
    console.error('❌ Error al obtener solicitud:', error);
    res.status(500).json({
      message: 'Error al obtener la solicitud',
      error: error.message
    });
  }
};

export const delSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitudEliminada = await Solicitud.findByIdAndDelete(id);

    if (!solicitudEliminada) {
      return res.status(404).json({
        message: 'Solicitud no encontrada'
      });
    }
    
    res.status(200).json({
      message: 'Solicitud eliminada exitosamente',
      data: solicitudEliminada
    });
  } catch (error) {
    console.error('❌ Error al eliminar solicitud:', error);
    res.status(500).json({
      message: 'Error al eliminar la solicitud',
      error: error.message
    });
  }
};

export const rechazarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitudRechazada = await Solicitud.findByIdAndUpdate(id, { estado: 'Rechazada' }, { new: true });

    if (!solicitudRechazada) {
      return res.status(404).json({
        message: 'Solicitud no encontrada'
      });
    }

    res.status(200).json({
      message: 'Solicitud rechazada exitosamente',
      data: solicitudRechazada
    });
  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    res.status(500).json({
      message: 'Error al rechazar la solicitud',
      error: error.message
    });
  }
};

export const aceptarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitudAceptada = await Solicitud.findByIdAndUpdate(id, { estado: 'Aceptada' }, { new: true });

    if (!solicitudAceptada) {
      return res.status(404).json({
        message: 'Solicitud no encontrada'
      });
    }

    res.status(200).json({
      message: 'Solicitud aceptada exitosamente',
      data: solicitudAceptada
    });
  } catch (error) {
    console.error('Error al aceptar solicitud:', error);
    res.status(500).json({
      message: 'Error al aceptar la solicitud',
      error: error.message
    });
  }
};
