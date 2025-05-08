import express from 'express';
import { chromium } from 'playwright';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { enviarEmail } from '../services/email.js';
import prisma from '../libs/prisma.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Authentication middleware
function authMiddleware(req, res, next) {
  if (!req.session.usuarioId) {
    return res.redirect('/');
  }
  next();
}

// Get user tasks with optional filter
router.get('/', authMiddleware, async (req, res) => {
  const usuarioId = req.session.usuarioId;
  const { ordem = 'asc', situacao = ''} = req.query;

  const where = {
    usuario_id: usuarioId,
    ...(situacao ? { situacao } : {}),
  };

  const tarefas = await prisma.tarefa.findMany({
    where,
    orderBy: {
      data_prevista: ordem === 'desc' ? 'desc' : 'asc',
    },
  });

  const tarefasFormatadas = tarefas.map(tarefa => ({
    ...tarefa,
    data_criacao_fmt: tarefa.data_criacao ? format(tarefa.data_criacao, 'dd/MM/yyyy', { locale: ptBR }) : '—',
    data_prevista_fmt: tarefa.data_prevista ? format(tarefa.data_prevista, 'dd/MM/yyyy', { locale: ptBR }) : '—',
    data_encerramento_fmt: tarefa.data_encerramento ? format(tarefa.data_encerramento, 'dd/MM/yyyy', { locale: ptBR }) : '—',
  }));

  res.render('tarefas', {
     tarefas: tarefasFormatadas,
     ordem,
     situacao, 
  });
});

// Form create task
router.get('/nova', authMiddleware, (req, res) => {
  res.render('form-tarefa', { tarefa: null });
});

// Form edit task
router.get('/:id/editar', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const tarefa = await prisma.tarefa.findUnique({
    where: { id: Number(id) },
  });

  if (!tarefa) {
    return res.status(404).send('Tarefa não encontrada');
  }

  res.render('form-tarefa', { tarefa });
});

// Create task
router.post('/nova', authMiddleware, async (req, res) => {
  const usuarioId = req.session.usuarioId;
  const { descricao, data_prevista } = req.body;

  await prisma.tarefa.create({
    data: {
      descricao,
      data_prevista: new Date(data_prevista),
      usuario_id: usuarioId,
    },
  });

  // Send email notification for new task
  const html = await htmlEmailContent(
    'Nova tarefa adicionada',
    req.session.usuarioNome,
    'adicionada',
    descricao,
    data_prevista,
  );

  await enviarEmail(req.session.usuarioEmail, 'Nova tarefa adicionada', html);

  res.redirect('/tarefas');
});

// Edit task
router.post('/:id/editar', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { descricao, data_prevista, situacao } = req.body;

  await prisma.tarefa.update({
    where: { id: Number(id) },
    data: {
      descricao,
      data_prevista: new Date(data_prevista),
      data_encerramento: situacao === 'FINALIZADA' ? new Date() : null,
      situacao,
    },
  });

// Send email notification for task completion
  if (situacao === 'FINALIZADA') {
    const html = await htmlEmailContent(
      'Tarefa finalizada',
      req.session.usuarioNome,
      'finalizada',
      descricao,
      data_prevista,
      new Date(),
    );

    await enviarEmail(req.session.usuarioEmail, 'Tarefa finalizada', html);
  }

  res.redirect('/tarefas');
});

// Export tasks to PDF
router.get('/exportar-pdf', authMiddleware, async (req, res) => {
  const usuarioId = req.session.usuarioId;
  const { ordem = 'asc', situacao = '' } = req.query;

  const where = {
    usuario_id: usuarioId,
    ...(situacao ? { situacao } : {}),
  };

  const tarefas = await prisma.tarefa.findMany({
    where,
    orderBy: {
      data_prevista: ordem === 'desc' ? 'desc' : 'asc',
    },
  });

  const tarefasFormatadas = tarefas.map(tarefa => ({
    ...tarefa,
    data_criacao_fmt: tarefa.data_criacao ? format(tarefa.data_criacao, 'dd/MM/yyyy', { locale: ptBR }) : '—',
    data_prevista_fmt: tarefa.data_prevista ? format(tarefa.data_prevista, 'dd/MM/yyyy', { locale: ptBR }) : '—',
    data_encerramento_fmt: tarefa.data_encerramento ? format(tarefa.data_encerramento, 'dd/MM/yyyy', { locale: ptBR }) : '—',
  }));

  const html = await ejs.renderFile(
    path.join(__dirname, '../views/tarefas-pdf.ejs'),
    { tarefas: tarefasFormatadas },
  );

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
  });
  
  await browser.close();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="tarefas.pdf"');
  res.send(pdfBuffer);
});

// Mount email content function
async function htmlEmailContent(assunto, nomeUsuario, tipoAcao, descricao, dataPrevista, dataEncerramento) {
  return await ejs.renderFile(path.join(__dirname, '../views/tarefas-email.ejs'), {
    assunto: assunto,
    nomeUsuario: nomeUsuario,
    tipoAcao: tipoAcao,
    descricao: descricao,
    dataPrevista: format(new Date(dataPrevista), 'dd/MM/yyyy', { locale: ptBR }),
    dataEncerramento: dataEncerramento ? format(new Date(dataEncerramento), 'dd/MM/yyyy', { locale: ptBR }) : null,
  });
}

export default router;