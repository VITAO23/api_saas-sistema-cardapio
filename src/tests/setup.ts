import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const testDbPath = path.join(process.cwd(), 'test.db');

export async function setup() {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  process.env.DATABASE_URL = `file:./test.db`;

  try {
    execSync('npx prisma migrate deploy --skip-generate', {
      cwd: process.cwd(),
      stdio: 'pipe'
    });
  } catch (error) {
    console.error('Failed to run migrations for test database');
  }
}

export async function teardown() {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
}
