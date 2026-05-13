import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { CategoryController } from '../controllers/CategoryController';
import { ProductController } from '../controllers/ProductController';
import { authMiddleware } from '../middlewares/authMiddleware';

const routes = Router();

const authController = new AuthController();
const categoryController = new CategoryController();
const productController = new ProductController();

routes.post('/login', authController.login);

routes.post('/categories', authMiddleware, categoryController.create);
routes.get('/categories', authMiddleware, categoryController.index);

routes.post('/products', authMiddleware, productController.create);
routes.get('/products', authMiddleware, productController.index);

routes.post('/register', authController.register);

export { routes };