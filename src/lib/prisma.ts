let prisma: any;

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is required. Configure Supabase Postgres in your environment.');
}

try {
	const { PrismaClient } = require('@prisma/client');

	prisma = new PrismaClient();
} catch {
	throw new Error(
		'Prisma client not generated. Create the database and run npm run prisma:generate.'
	);
}

export { prisma };