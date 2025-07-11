import { enviarEmail } from '../services/email.js';
import nodemailer from 'nodemailer';

vi.mock('nodemailer');

describe('enviarEmail', () => {
    
  beforeEach(() => {
      vi.clearAllMocks();
  });

  const mockUser = 'mockeduser@example.com';
  const mockPass = 'mockedpassword';
  process.env.EMAIL_USER = mockUser;
  process.env.EMAIL_PASS = mockPass;

  const destinatario = 'test@example.com';
  const assunto = 'Test Subject';
  const conteudoHtml = '<p>Test Content</p>';

  it('should send an email with the correct parameters', async () => {
    const sendMailMock = vi.fn().mockResolvedValue({});
    nodemailer.createTransport.mockReturnValue({
       sendMail: sendMailMock, 
    });

    await enviarEmail(destinatario, assunto, conteudoHtml);

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    expect(sendMailMock).toHaveBeenCalledWith({
      from: `"Gestor de Tarefas" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: assunto,
      html: conteudoHtml,
    });
  });

  it('should throw an error if sending email fails', async () => {
    const sendMailMock = vi.fn().mockRejectedValue(new Error('Failed to send email'));
    nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

    await expect(enviarEmail(destinatario, assunto, conteudoHtml))
      .rejects
      .toThrow('Failed to send email');
  });
});