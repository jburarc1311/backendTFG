import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const enviarEmailContacto = async ({ nombre, motivo, mensaje }) => {
  try {
    const response = await resend.emails.send({
      from: "AdoptMee <no-reply@adoptmee.site>",
      to: "joseab078@gmail.com",
      subject: `Contacto: ${motivo}`,
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><b>Nombre:</b> ${nombre}</p>
        <p><b>Motivo:</b> ${motivo}</p>
        <p><b>Mensaje:</b> ${mensaje}</p>
      `,
    });

    console.log("RESEND RESPONSE:", response);

    return response;

  } catch (error) {
    console.error("ERROR RESEND:", error);

    throw error;
  }
};


export const enviaremailActivacion = async (email, url, name) => {
  return await resend.emails.send({
    from: "AdoptMee <no-reply@adoptmee.site>",
    to: email,
    subject: "Activa tu cuenta",
    html: `
      <h1>Hola ${name}</h1>
      <p>Activa tu cuenta aquí:</p>
      <a href="${url}">${url}</a>
    `,
  });
};
