"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
let prisma;
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required. Configure Supabase Postgres in your environment.');
}
try {
    const { PrismaClient } = require('@prisma/client');
    exports.prisma = prisma = new PrismaClient();
}
catch {
    throw new Error('Prisma client not generated. Create the database and run npm run prisma:generate.');
}
