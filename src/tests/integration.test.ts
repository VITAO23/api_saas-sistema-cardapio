import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';

describe('Integration Tests', () => {
  let authToken: string = '';
  let userId: string = '';
  let restaurantId: string = '';
  let categoryId: string = '';
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = '123456';

  beforeAll(async () => {
    await prisma.$executeRawUnsafe('DELETE FROM Product');
    await prisma.$executeRawUnsafe('DELETE FROM Category');
    await prisma.$executeRawUnsafe('DELETE FROM User');
    await prisma.$executeRawUnsafe('DELETE FROM Restaurant');

    // Create a restaurant for testing
    const restaurant = await prisma.restaurant.create({
      data: {
        name: 'Test Restaurant',
        slug: `test-restaurant-${Date.now()}`,
        whatsapp: '31999990000'
      }
    });
    restaurantId = restaurant.id;

    // Register a test user
    const registerRes = await request(app)
      .post('/register')
      .send({
        name: 'Test User',
        email: testEmail,
        password: testPassword,
        restaurantId
      });

    userId = registerRes.body.id;

    // Login to get auth token
    const loginRes = await request(app)
      .post('/login')
      .send({
        email: testEmail,
        password: testPassword
      });

    authToken = loginRes.body.token;

    // Create a test category
    const categoryRes = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Lanches'
      });

    categoryId = categoryRes.body.id;
  });

  describe('POST /register', () => {
    it('should not register with invalid email', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          name: 'Invalid User',
          email: 'not-an-email',
          password: '123456',
          restaurantId
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should not register with password too short', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          name: 'Short Pass User',
          email: `short${Date.now()}@example.com`,
          password: '123',
          restaurantId
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /login', () => {
    it('should not login with wrong password', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: testEmail,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
    });

    it('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'nonexistent@example.com',
          password: '123456'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /categories (protected)', () => {
    it('should not create category without token', async () => {
      const response = await request(app)
        .post('/categories')
        .send({
          name: 'Lanches'
        });

      expect(response.status).toBe(401);
    });

    it('should not create category with name too short', async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'A'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /categories (protected)', () => {
    it('should list categories for authenticated user', async () => {
      const response = await request(app)
        .get('/categories')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should not list categories without token', async () => {
      const response = await request(app)
        .get('/categories');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /products (protected)', () => {
    it('should not create product without token', async () => {
      const response = await request(app)
        .post('/products')
        .send({
          name: 'X-Salada',
          price: 24.9,
          categoryId: categoryId || 'invalid-id',
          available: true
        });

      expect(response.status).toBe(401);
    });

    it('should create product with valid token', async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'X-Salada',
          description: 'Hamburger with salad',
          price: '24.9',
          categoryId,
          available: 'true'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('X-Salada');
      expect(response.body.price).toBe(24.9);
    });

    it('should not create product with invalid price', async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Invalid Product',
          price: '-10',
          categoryId
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should not create product with invalid category', async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Product',
          price: '10.0',
          categoryId: 'invalid-uuid'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /products (protected)', () => {
    it('should list products for authenticated user', async () => {
      const response = await request(app)
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should not list products without token', async () => {
      const response = await request(app)
        .get('/products');

      expect(response.status).toBe(401);
    });
  });
});
