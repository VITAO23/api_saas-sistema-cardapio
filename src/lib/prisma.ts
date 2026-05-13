let prisma: any;

try {
	const { PrismaClient } = require('@prisma/client');

	prisma = new PrismaClient();
} catch {
	throw new Error(
		'Prisma client not generated. Create the database and run npm run prisma:generate.'
	);
}

export { prisma };