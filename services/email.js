import nodemailer from 'nodemailer';
import { env } from 'process';

export async function enviarEmail(destinatario, assunto, conteudoHtml) {
  const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  }
});

  await transporter.sendMail({
    from: `"Gestor de Tarefas" <${env.EMAIL_USER}>`,
    to: destinatario,
    subject: assunto,
    html: conteudoHtml,
  });
}