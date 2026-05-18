import { enviarEmailContacto } from '../services/resend.js';

export const crearContacto = async (req, res) => { // metodo para el contacto
  try {
    const { nombre, motivo, mensaje } = req.body; //leemos el body
    await enviarEmailContacto({ nombre, motivo, mensaje }); // llamamos el metodo de resend y le pasamos los parametros que pide
    res.status(201).json({ message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};