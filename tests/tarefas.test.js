import { describe, it, beforeEach, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import tarefasRouter from '../routes/tarefas';
import prisma from '../libs/prisma';
import { enviarEmail } from '../services/email';
import ejs from 'ejs';

// Mocks
vi.mock('../libs/prisma', () => ({
  default: {
    tarefa: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    }
  }
}));

vi.mock('../services/email', () => ({
  enviarEmail: vi.fn(),
}));

vi.mock('ejs', async () => {
  const ejs = await vi.importActual('ejs');
  return {
    ...ejs,
    renderFile: vi.fn().mockResolvedValue('<html>Mocked HTML</html>'),
  };
});

// App config
const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
app.use((req, res, next) => {
  req.session.usuarioId = 1;
  req.session.usuarioNome = 'Test User';
  req.session.usuarioEmail = 'test@example.com';
  next();
});
app.use('/tarefas', tarefasRouter);

describe('Tarefas Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /tarefas should render task list', async () => {
    prisma.tarefa.findMany.mockResolvedValue([]);
    const res = await request(app).get('/tarefas');
    expect(res.status).toBe(200);
    expect(res.text).toContain('tarefas');
  });

  it('GET /tarefas/nova should render form', async () => {
    const res = await request(app).get('/tarefas/nova');
    expect(res.status).toBe(200);
  });

  it('POST /tarefas/nova should create task and send email', async () => {
    prisma.tarefa.create.mockResolvedValue({});
    const res = await request(app)
      .post('/tarefas/nova')
      .send({ descricao: 'Nova tarefa', data_prevista: '2025-05-10' });

    expect(prisma.tarefa.create).toHaveBeenCalled();
    expect(enviarEmail).toHaveBeenCalledWith(
      'test@example.com',
      'Nova tarefa adicionada',
      expect.any(String)
    );
    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/tarefas');
  });

  it('GET /tarefas/:id/editar should show edit form', async () => {
    prisma.tarefa.findUnique.mockResolvedValue({ id: 1 });
    const res = await request(app).get('/tarefas/1/editar');
    expect(res.status).toBe(200);
  });

  it('POST /tarefas/:id/editar should update task and send email if finalized', async () => {
    prisma.tarefa.update.mockResolvedValue({});
    const res = await request(app)
      .post('/tarefas/1/editar')
      .send({ descricao: 'Atualizada', data_prevista: '2025-05-10', situacao: 'FINALIZADA' });

    expect(prisma.tarefa.update).toHaveBeenCalled();
    expect(enviarEmail).toHaveBeenCalledWith(
      'test@example.com',
      'Tarefa finalizada',
      expect.any(String)
    );
    expect(res.status).toBe(302);
  });

  // it('GET /tarefas/exportar-pdf should generate and return PDF', async () => {
  //   // Mock tarefas para PDF
  //   prisma.tarefa.findMany.mockResolvedValue([{
  //     descricao: 'Mocked task',
  //     data_criacao: new Date(),
  //     data_prevista: new Date(),
  //     data_encerramento: new Date(),
  //   }]);

  //   // Mock browser
  //   const mockPdfBuffer = Buffer.from('PDF');
  //   vi.mock('playwright', () => ({
  //     chromium: {
  //       launch: vi.fn().mockResolvedValue({
  //         newPage: vi.fn().mockResolvedValue({
  //           setContent: vi.fn(),
  //           pdf: vi.fn().mockResolvedValue(mockPdfBuffer),
  //         }),
  //         close: vi.fn(),
  //       }),
  //     },
  //   }));

  //   const res = await request(app).get('/tarefas/exportar-pdf');
  //   expect(res.status).toBe(200);
  //   expect(res.header['content-type']).toBe('application/pdf');
  // });
});
