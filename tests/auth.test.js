import request from 'supertest';
import express from 'express';
import session from 'express-session';
import authRouter from '../routes/auth.js';

vi.mock('../libs/prisma.js', () => ({
  default: {
    usuario: {
      findUnique: vi.fn(),
    },
  }
}));

vi.mock("bcrypt", () => ({
  default: {
    compare: vi.fn(),
  }
}));

import prisma from '../libs/prisma.js';
import bcrypt from 'bcrypt';

const app = express();
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
app.use('/', authRouter);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Auth Routes', () => {

  it('should render login page', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Login');
  });

  it('should return error if user not found', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/login')
      .send({ email: 'invalid@example.com', senha: '123456' });

      expect(res.status).toBe(200);
      expect(res.text).toContain('Email ou senha inválidos');
  });

  it('should return error if password is incorrect', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      nome: 'Test User',
      email: 'test@example.com',
      senha: 'hashedpassword',
    });

    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
    .post('/login')
    .send({ email: 'test@example.com', senha: 'wrongpassword' });

    expect(res.status).toBe(200);
    expect(res.text).toContain('Email ou senha inválidos');
  });

  it('should redirect and set session with valid credentials', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      nome: 'Test User',
      email: 'test@example.com',
      senha: 'hashedpassword',
    });

    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/login')
      .send({ email: 'test@example.com', senha: 'correctpassword' });

    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/tarefas');
  });

  it('should destroy session and redirect', async () => {
    const res = await request(app).get('/logout');
    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/');
  });
});