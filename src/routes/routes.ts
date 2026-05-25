import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { CategoryController } from '../controllers/CategoryController';
import { ProductController } from '../controllers/ProductController';
import { PublicController } from '../controllers/PublicController';
import { RestaurantController } from '../controllers/RestaurantController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { uploadProductImage } from '../middlewares/uploadProductImage';
import { createSupabaseUploadMiddleware } from '../middlewares/uploadToSupabase';

const routes = Router();

const authController = new AuthController();
const categoryController = new CategoryController();
const productController = new ProductController();
const publicController = new PublicController();
const restaurantController = new RestaurantController();

const uploadAvatarMiddleware = createSupabaseUploadMiddleware({
  folder: 'avatars',
  fieldName: 'avatar',
  bucket: 'avatars'
});

const uploadLogoMiddleware = createSupabaseUploadMiddleware({
  folder: 'logo',
  fieldName: 'logo',
  bucket: 'logo'
});

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

// User profile routes (authenticated)
routes.get('/users/me', authMiddleware, authController.me);
routes.put('/users/me', authMiddleware, authController.updateMe);
routes.post('/users/me/avatar', authMiddleware, uploadAvatarMiddleware, authController.uploadAvatar);

// Authenticated restaurant routes for admin automation
routes.get('/restaurants/me', authMiddleware, restaurantController.me);
routes.put('/restaurants/me', authMiddleware, restaurantController.update);
routes.get('/restaurants/me/qr', authMiddleware, restaurantController.myQr);
routes.post('/restaurants/me/logo', authMiddleware, uploadLogoMiddleware, restaurantController.uploadLogo);
routes.post('/restaurants/:id/delivery-area', authMiddleware, restaurantController.setDeliveryArea);

// Public menu routes (no auth)
routes.get('/r/:slug', publicController.show);
routes.get('/r/:slug/qr', publicController.qr);
routes.get('/assets/proxy', publicController.proxyAsset);
// Alias routes for backwards compatibility / frontend expectations
routes.get('/restaurants/:slug', publicController.show);
routes.get('/restaurants/:slug/qr', publicController.qr);

export { routes };