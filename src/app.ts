import cors from 'cors';
import express from 'express';
import path from 'path';
import { routes } from './routes/routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(routes);

export { app };