import express from 'express';
import bcrypt from 'bcrypt';
import prisma from '../libs/prisma.js';

const router = express.Router();

// Call login route
router.get('/', (req, res) => {
  res.render('login', { error: null, title: 'Login' });
});

// Handle login form submission
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  
  if (!usuario || !await bcrypt.compare(senha, usuario.senha)) {
    return res.render('login', { error: 'Email ou senha inválidos', title: 'Login' });
  }

  req.session.usuarioId = usuario.id;
  req.session.usuarioNome = usuario.nome;
  req.session.usuarioEmail = usuario.email;
  
  res.redirect('/tarefas');
});

// Handle logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

export default router;