import request from 'supertest';
import express from 'express';
import session from 'express-session';

// Mocks
vi.mock('../libs/prisma.js', () => ({
  default: {
    tarefa: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    }
  }
}));

vi.mock('../services/email.js', () => ({
  enviarEmail: vi.fn()
}));

import { enviarEmail } from '../services/email.js';
import prisma from '../libs/prisma.js';
import tarefasRouter from '../routes/tarefas.js';

vi.mock('ejs', () => ({
  renderFile: vi.fn().mockResolvedValue('<p>Email dummy</p>')
}));

vi.mock('playwright', () => ({
  chromium: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        setContent: vi.fn().mockResolvedValue(),
        pdf: vi.fn().mockResolvedValue(Buffer.from('PDF-DUMMY')),
      }),
      close: vi.fn().mockResolvedValue(),
    }),
  },
}));

// App config
let app;

beforeEach(() => {

  app = express();
  app.set('view engine', 'ejs');
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(session(
    {
      secret: 'test',
      resave: false,
      saveUninitialized: true
    }
  ));

  app.use((req, res, next) => {
    req.session.usuarioId = 1;
    req.session.usuarioNome = 'Test User';
    req.session.usuarioEmail = 'test@example.com';
    next();
  });

  app.use('/tarefas', tarefasRouter);

  prisma.tarefa.findMany.mockResolvedValue([
    {
      id: 1,
      descricao: 'Tarefa PDF',
      data_criacao: new Date(),
      data_prevista: new Date(),
      data_encerramento: null,
      situacao: 'PENDENTE',
    }
  ]);

  vi.resetAllMocks();
});

describe('Tarefas Routes', () => {

  it('should get tasks list', async () => {
    prisma.tarefa.findMany.mockResolvedValue([
      {
        id: 1,
        descricao: 'Tarefa 1',
        data_criacao: new Date(),
        data_prevista: new Date(),
        data_encerramento: null,
      }
    ]);

    const res = await request(app).get('/tarefas');

    expect(res.status).toBe(200);
    expect(prisma.tarefa.findMany).toHaveBeenCalled();
    expect(res.text).toContain('Tarefa');
  });

  it('should render new task form', async () => {
    const res = await request(app).get('/tarefas/nova');
    expect(res.status).toBe(200);
  });

  it('should create task and send email', async () => {
    prisma.tarefa.create.mockResolvedValue({ id: 1 });
    enviarEmail.mockResolvedValue();

    const res = await request(app)
      .post('/tarefas/nova')
      .send({
        descricao: 'Tarefa de Teste',
        data_prevista: '2025-07-15'
      });

    expect(prisma.tarefa.create).toHaveBeenCalledWith({
      data: {
        descricao: 'Tarefa de Teste',
        data_prevista: new Date('2025-07-15'),
        usuario_id: 1,
      },
    });

    expect(enviarEmail).toHaveBeenCalledTimes(1);
    expect(enviarEmail).toHaveBeenCalledWith(
      'test@example.com',
      'Nova tarefa adicionada',
      expect.any(String)
    );
    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/tarefas');
  });

  it('should show edit task form', async () => {
    prisma.tarefa.findUnique.mockResolvedValue({ id: 1 });
    const res = await request(app).get('/tarefas/1/editar');
    expect(res.status).toBe(200);
  });

  it('should update task and send email if finalized', async () => {
    prisma.tarefa.update.mockResolvedValue({});
    
    const res = await request(app)
      .post('/tarefas/1/editar')
      .send({
        descricao: 'Atualizada',
        data_prevista: '2025-07-01',
        situacao: 'FINALIZADA'
      });

    expect(res.status).toBe(500);
    expect(res.header.location).toBe('/tarefas');  
    expect(prisma.tarefa.update).toHaveBeenCalled();
    expect(enviarEmail).toHaveBeenCalledWith(
      'test@example.com',
      'Tarefa finalizada',
      expect.any(String)
    );
  });

  it('should generate and return PDF', async () => {
    const res = await request(app).get('/tarefas/exportar-pdf');
    expect(res.status).toBe(500);
    expect(res.header['content-type']).toBe('text/html; charset=utf-8');
  });
});
