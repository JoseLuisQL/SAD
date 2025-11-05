interface EmailOptions {
  to: string;
  subject: string;
  body: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  console.log('📧 Notificación de correo (dummy):');
  console.log(`   Para: ${options.to}`);
  console.log(`   Asunto: ${options.subject}`);
  console.log(`   Mensaje: ${options.body}`);
  
  // TODO: Implementar envío real de correo electrónico cuando sea necesario
  // Posibles opciones: nodemailer, sendgrid, AWS SES, etc.
};

export default {
  sendEmail
};
