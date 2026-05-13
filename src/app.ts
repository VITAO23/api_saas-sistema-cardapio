import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { rateLimit } from 'express-rate-limit';
import { routes } from './routes/routes';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
	.split(',')
	.map((origin) => origin.trim())
	.filter((origin) => origin.length > 0);

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? '900000');
const maxRequests = Number(process.env.RATE_LIMIT_MAX ?? '100');

app.set('trust proxy', process.env.TRUST_PROXY === 'true');

app.use(
	helmet({
		crossOriginResourcePolicy: { policy: 'cross-origin' }
	})
);

app.use(
	rateLimit({
		windowMs: Number.isFinite(windowMs) ? windowMs : 900000,
		max: Number.isFinite(maxRequests) ? maxRequests : 100,
		standardHeaders: true,
		legacyHeaders: false,
		message: {
			error: 'Too many requests, please try again later.'
		}
	})
);

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
				callback(null, true);
				return;
			}

			callback(new Error('Origin not allowed by CORS'));
		},
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true
	})
);
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(routes);

export { app };