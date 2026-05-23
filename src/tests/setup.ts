import { execSync } from 'child_process';

export async function setup() {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;

  if (!testDatabaseUrl) {
    throw new Error('TEST_DATABASE_URL is required to run integration tests.');
  }

  process.env.DATABASE_URL = testDatabaseUrl;

  try {
    execSync('npx prisma migrate deploy --skip-generate', {
      cwd: process.cwd(),
      stdio: 'pipe'
    });
  } catch (error) {
    console.error('Failed to apply migrations to the test database');
    throw error;
  }
}

export async function teardown() {
  return;
}
