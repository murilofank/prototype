import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
  const tasks = await prisma.tarefa.findMany({
    orderBy: { data_criacao: 'desc' },
  });
  res.render('index', { tasks });
});

app.listen(port, () => console.log(`Server is running at http://localhost:${port}`));