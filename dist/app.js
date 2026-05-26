"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const express_rate_limit_1 = require("express-rate-limit");
const routes_1 = require("./routes/routes");
const app = (0, express_1.default)();
exports.app = app;
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
function matchesWildcardOrigin(origin) {
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
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
const corsOptions = {
    origin: (origin, callback) => {
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
app.use((0, cors_1.default)(corsOptions));
app.options(/.*/, (0, cors_1.default)(corsOptions));
if (!isDevelopment) {
    app.use((0, express_rate_limit_1.rateLimit)({
        windowMs: Number.isFinite(windowMs) ? windowMs : 9000000,
        max: Number.isFinite(maxRequests) ? maxRequests : 1000,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            error: 'Too many requests, please try again later.'
        }
    }));
}
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
app.use(routes_1.routes);
