import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import authRouter from '../routes/auth';
import bcrypt from 'bcrypt';
import prisma from '../libs/__mocks__/prisma'

vi.mock('../libs/prisma')

vi.mock('bcrypt');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
app.use('/', authRouter);


describe('Auth Routes', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET / should render login page', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Login');
  });

  it('POST /login with invalid credentials should render login page with error', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/login')
      .send({ email: 'invalid@example.com', senha: 'wrongpassword' });

      expect(res.status).toBe(200);
      expect(res.text).toContain('Email ou senha inválidos');
  });

  it('POST /login with valid credentials should redirect and set session', async () => {
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

  it('GET /logout should destroy session and redirect', async () => {
    const res = await request(app).get('/logout');
    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/');
  });
});