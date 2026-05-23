"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup = setup;
exports.teardown = teardown;
const child_process_1 = require("child_process");
async function setup() {
    const testDatabaseUrl = process.env.TEST_DATABASE_URL;
    if (!testDatabaseUrl) {
        throw new Error('TEST_DATABASE_URL is required to run integration tests.');
    }
    process.env.DATABASE_URL = testDatabaseUrl;
    try {
        (0, child_process_1.execSync)('npx prisma migrate deploy --skip-generate', {
            cwd: process.cwd(),
            stdio: 'pipe'
        });
    }
    catch (error) {
        console.error('Failed to apply migrations to the test database');
        throw error;
    }
}
async function teardown() {
    return;
}
