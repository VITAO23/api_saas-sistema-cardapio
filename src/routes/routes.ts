import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { CategoryController } from '../controllers/CategoryController';
import { ProductController } from '../controllers/ProductController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { uploadProductImage } from '../middlewares/uploadProductImage';

const routes = Router();

const authController = new AuthController();
const categoryController = new CategoryController();
const productController = new ProductController();

routes.post('/login', authController.login);

routes.post('/categories', authMiddleware, categoryController.create);
routes.get('/categories', authMiddleware, categoryController.index);
routes.put('/categories/:id', authMiddleware, categoryController.update);
routes.delete('/categories/:id', authMiddleware, categoryController.delete);

routes.post('/products', authMiddleware, uploadProductImage, productController.create);
routes.get('/products', authMiddleware, productController.index);
routes.put('/products/:id', authMiddleware, uploadProductImage, productController.update);
routes.delete('/products/:id', authMiddleware, productController.delete);

routes.post('/register', authController.register);

export { routes };