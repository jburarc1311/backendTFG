import { enviarEmailContacto } from '../services/resend.js';

export const crearContacto = async (req, res) => {
  try {
    const { nombre, motivo, mensaje } = req.body;
    await enviarEmailContacto({ nombre, motivo, mensaje });
    res.status(201).json({ message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};