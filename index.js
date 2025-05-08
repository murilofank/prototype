import express from 'express';
import path from 'path';
import session from 'express-session';
import authRouter from './routes/auth.js';
import tarefasRouter from './routes/tarefas.js';
import { env } from 'process';

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve(), 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

//Routes
app.use('/', authRouter);
app.use('/tarefas', tarefasRouter);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
});

export default app;