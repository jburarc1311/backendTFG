import nodemailer from 'nodemailer';    

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

export const enviarEmailActivacion = async (to, subject, htmlContent) => {

    console.log('Enviando email a:', to);
    console.log('Asunto:', subject);

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: htmlContent
        });

        console.log('✅ Correo enviado exitosamente:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Error enviando correo:', error.message);
        throw error;
    }
}

export const enviarEmailContacto = async ({ nombre, motivo, mensaje }) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `Nuevo mensaje de contacto: ${motivo}`,
            html: `
                <h2>Nuevo mensaje de contacto</h2>
                <p><strong>Nombre:</strong> ${nombre}</p>
                <p><strong>Motivo:</strong> ${motivo}</p>
                <p><strong>Mensaje:</strong></p>
                <p>${mensaje}</p>
            `
        });
        console.log('Email de contacto enviado: ', info.messageId);
    } catch (error) {
        console.error('Error enviando email de contacto:', error);
        throw error; // 👈 importante: relanza el error para que el controlador devuelva 500
    }
};