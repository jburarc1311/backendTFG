import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const enviaremailActivacion = async (to, urlActivacion, name) => {
  return await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject: "Activa tu cuenta",
    html: `
      <h1>Hola ${name}</h1>
      <p>Activa tu cuenta aquí:</p>
      <a href="${urlActivacion}">Activar cuenta</a>
    `,
  });
};
