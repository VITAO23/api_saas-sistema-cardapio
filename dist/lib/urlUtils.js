"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicOrigin = getPublicOrigin;
function getPublicOrigin() {
    const corsOrigins = (process.env.CORS_ORIGINS ?? '')
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0);
    return process.env.PUBLIC_ORIGIN ?? corsOrigins[0] ?? `http://localhost:${process.env.PORT ?? 3333}`;
}
