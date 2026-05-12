import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const emailShell = ({ title, eyebrow, body }) => `
  <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;box-shadow:0 12px 32px rgba(15,23,42,0.08);">
        <div style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);padding:28px 32px;color:#ffffff;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.9;">${eyebrow}</p>
          <h1 style="margin:0;font-size:28px;line-height:1.2;">${title}</h1>
        </div>
        <div style="padding:32px;line-height:1.7;font-size:15px;">
          ${body}
        </div>
      </div>
      <p style="margin:16px 0 0;text-align:center;font-size:12px;color:#6b7280;">
        AdoptMee · Gestión de adopciones y contacto
      </p>
    </div>
  </div>
`;

export const enviarEmailContacto = async ({ nombre, motivo, mensaje }) => {
  try {
    const response = await resend.emails.send({
      from: "AdoptMee <no-reply@adoptmee.site>",
      to: "joseab078@gmail.com",
      subject: `Contacto: ${motivo}`,
      html: emailShell({
        eyebrow: "Nuevo mensaje",
        title: "Has recibido un mensaje de contacto",
        body: `
          <div style="background:#eff6ff;border:1px solid #dbeafe;border-radius:16px;padding:20px;margin-bottom:20px;">
            <p style="margin:0 0 8px;font-size:13px;color:#2563eb;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Resumen</p>
            <p style="margin:0;font-size:14px;color:#1f2937;">Revisa los datos del remitente y responde desde tu panel o correo habitual.</p>
          </div>
          <div style="display:block;">
            <p style="margin:0 0 12px;"><strong style="color:#111827;">Nombre:</strong> ${nombre}</p>
            <p style="margin:0 0 12px;"><strong style="color:#111827;">Motivo:</strong> ${motivo}</p>
            <div style="margin-top:20px;padding:18px;border-left:4px solid #2563eb;background:#f8fafc;border-radius:12px;">
              <p style="margin:0 0 8px;font-weight:700;color:#111827;">Mensaje</p>
              <p style="margin:0;white-space:pre-line;color:#374151;">${mensaje}</p>
            </div>
          </div>
        `,
      }),
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
    html: emailShell({
      eyebrow: "Verificación de cuenta",
      title: `Hola ${name}`,
      body: `
        <p style="margin:0 0 16px;color:#374151;">Ya casi terminas. Confirma tu cuenta para empezar a usar AdoptMee.</p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${url}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 24px;border-radius:999px;box-shadow:0 10px 18px rgba(37,99,235,0.22);">Activar cuenta</a>
        </div>
        <p style="margin:0 0 10px;color:#374151;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
        <p style="margin:0;word-break:break-all;"><a href="${url}" style="color:#2563eb;">${url}</a></p>
      `,
    }),
  });
};
