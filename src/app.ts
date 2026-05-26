import dotenv from 'dotenv';
dotenv.config();
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

const wildcardOrigins = (process.env.CORS_ORIGIN_PATTERNS ?? '')
	.split(',')
	.map((origin) => origin.trim())
	.filter((origin) => origin.length > 0);

const frontendOrigin = (process.env.FRONTEND_ORIGIN ?? '').trim();

// Keep only safe local defaults in code. Production origins must be set via env `CORS_ORIGINS`, `FALLBACK_ORIGINS`, or `FRONTEND_ORIGIN`.
const fallbackOrigins = (process.env.FALLBACK_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const corsAllowedOrigins = Array.from(new Set([...allowedOrigins, ...fallbackOrigins, ...(frontendOrigin ? [frontendOrigin] : [])]));

function matchesWildcardOrigin(origin: string) {
	return wildcardOrigins.some((pattern) => {
		const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
		const regex = new RegExp(`^${escaped}$`);
		return regex.test(origin);
	});
}

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? '900000');
const maxRequests = Number(process.env.RATE_LIMIT_MAX ?? '100');
const isDevelopment = process.env.NODE_ENV === 'development';

app.set('trust proxy', process.env.TRUST_PROXY === 'true');

app.use(
	helmet({
		crossOriginResourcePolicy: { policy: 'cross-origin' }
	})
);

const corsOptions = {
	origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
		// Allow requests without origin (e.g., same-origin requests)
		if (!origin) {
			callback(null, true);
			return;
		}

		// If no origins configured, allow all
		if (corsAllowedOrigins.length === 0) {
			callback(null, true);
			return;
		}

		// Check if origin is in allowed list
		if (corsAllowedOrigins.includes(origin)) {
			callback(null, true);
			return;
		}

		// Check wildcard origin patterns (e.g. Vercel preview domains)
		if (matchesWildcardOrigin(origin)) {
			callback(null, true);
			return;
		}

		// Origin not allowed, but don't throw error - just deny silently
		callback(null, false);
	},
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
	optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

if (!isDevelopment) {
	app.use(
		rateLimit({
			windowMs: Number.isFinite(windowMs) ? windowMs : 9000000,
			max: Number.isFinite(maxRequests) ? maxRequests : 1000,
			standardHeaders: true,
			legacyHeaders: false,
			message: {
				error: 'Too many requests, please try again later.'
			}
		})
	);
}
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(routes);

export { app };