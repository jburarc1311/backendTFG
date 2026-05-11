import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const enviarEmailContacto = async ({ nombre, motivo, mensaje }) => {
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: "tuemail@dominio.com",
    subject: `Contacto: ${motivo}`,
    html: `
      <h2>Nuevo mensaje de contacto</h2>
      <p><b>Nombre:</b> ${nombre}</p>
      <p><b>Motivo:</b> ${motivo}</p>
      <p><b>Mensaje:</b> ${mensaje}</p>
    `,
  });
};
