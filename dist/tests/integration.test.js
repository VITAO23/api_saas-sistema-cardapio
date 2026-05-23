"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
const prisma_1 = require("../lib/prisma");
(0, vitest_1.describe)('Integration Tests', () => {
    let authToken = '';
    let userId = '';
    let restaurantId = '';
    let categoryId = '';
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = '123456';
    (0, vitest_1.beforeAll)(async () => {
        await prisma_1.prisma.$executeRawUnsafe('DELETE FROM Product');
        await prisma_1.prisma.$executeRawUnsafe('DELETE FROM Category');
        await prisma_1.prisma.$executeRawUnsafe('DELETE FROM User');
        await prisma_1.prisma.$executeRawUnsafe('DELETE FROM Restaurant');
        // Create a restaurant for testing
        const restaurant = await prisma_1.prisma.restaurant.create({
            data: {
                name: 'Test Restaurant',
                slug: `test-restaurant-${Date.now()}`,
                whatsapp: '31999990000'
            }
        });
        restaurantId = restaurant.id;
        // Register a test user
        const registerRes = await (0, supertest_1.default)(app_1.app)
            .post('/register')
            .send({
            name: 'Test User',
            email: testEmail,
            password: testPassword,
            restaurantId
        });
        userId = registerRes.body.id;
        // Login to get auth token
        const loginRes = await (0, supertest_1.default)(app_1.app)
            .post('/login')
            .send({
            email: testEmail,
            password: testPassword
        });
        authToken = loginRes.body.token;
        // Create a test category
        const categoryRes = await (0, supertest_1.default)(app_1.app)
            .post('/categories')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            name: 'Lanches'
        });
        categoryId = categoryRes.body.id;
    });
    (0, vitest_1.describe)('POST /register', () => {
        (0, vitest_1.it)('should not register with invalid email', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .post('/register')
                .send({
                name: 'Invalid User',
                email: 'not-an-email',
                password: '123456',
                restaurantId
            });
            (0, vitest_1.expect)(response.status).toBe(400);
            (0, vitest_1.expect)(response.body.errors).toBeDefined();
        });
        (0, vitest_1.it)('should not register with password too short', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .post('/register')
                .send({
                name: 'Short Pass User',
                email: `short${Date.now()}@example.com`,
                password: '123',
                restaurantId
            });
            (0, vitest_1.expect)(response.status).toBe(400);
            (0, vitest_1.expect)(response.body.errors).toBeDefined();
        });
    });
    (0, vitest_1.describe)('POST /login', () => {
        (0, vitest_1.it)('should not login with wrong password', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .post('/login')
                .send({
                email: testEmail,
                password: 'wrongpassword'
            });
            (0, vitest_1.expect)(response.status).toBe(400);
        });
        (0, vitest_1.it)('should not login with non-existent email', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .post('/login')
                .send({
                email: 'nonexistent@example.com',
                password: '123456'
            });
            (0, vitest_1.expect)(response.status).toBe(400);
        });
    });
    (0, vitest_1.describe)('POST /categories (protected)', () => {
        (0, vitest_1.it)('should not create category without token', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .post('/categories')
                .send({
                name: 'Lanches'
            });
            (0, vitest_1.expect)(response.status).toBe(401);
        });
        (0, vitest_1.it)('should not create category with name too short', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .post('/categories')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                name: 'A'
            });
            (0, vitest_1.expect)(response.status).toBe(400);
            (0, vitest_1.expect)(response.body.errors).toBeDefined();
        });
    });
    (0, vitest_1.describe)('GET /categories (protected)', () => {
        (0, vitest_1.it)('should list categories for authenticated user', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/categories')
                .set('Authorization', `Bearer ${authToken}`);
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(Array.isArray(response.body)).toBe(true);
            (0, vitest_1.expect)(response.body.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should not list categories without token', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/categories');
            (0, vitest_1.expect)(response.status).toBe(401);
        });
    });
    (0, vitest_1.describe)('POST /products (protected)', () => {
        (0, vitest_1.it)('should not create product without token', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .post('/products')
                .send({
                name: 'X-Salada',
                price: 24.9,
                categoryId: categoryId || 'invalid-id',
                available: true
            });
            (0, vitest_1.expect)(response.status).toBe(401);
        });
        (0, vitest_1.it)('should create product with valid token', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                name: 'X-Salada',
                description: 'Hamburger with salad',
                price: '24.9',
                categoryId,
                available: 'true'
            });
            (0, vitest_1.expect)(response.status).toBe(201);
            (0, vitest_1.expect)(response.body).toHaveProperty('id');
            (0, vitest_1.expect)(response.body.name).toBe('X-Salada');
            (0, vitest_1.expect)(response.body.price).toBe(24.9);
        });
        (0, vitest_1.it)('should not create product with invalid price', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                name: 'Invalid Product',
                price: '-10',
                categoryId
            });
            (0, vitest_1.expect)(response.status).toBe(400);
            (0, vitest_1.expect)(response.body.errors).toBeDefined();
        });
        (0, vitest_1.it)('should not create product with invalid category', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                name: 'Product',
                price: '10.0',
                categoryId: 'invalid-uuid'
            });
            (0, vitest_1.expect)(response.status).toBe(400);
            (0, vitest_1.expect)(response.body.errors).toBeDefined();
        });
    });
    (0, vitest_1.describe)('GET /products (protected)', () => {
        (0, vitest_1.it)('should list products for authenticated user', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/products')
                .set('Authorization', `Bearer ${authToken}`);
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(Array.isArray(response.body)).toBe(true);
        });
        (0, vitest_1.it)('should not list products without token', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/products');
            (0, vitest_1.expect)(response.status).toBe(401);
        });
    });
});
