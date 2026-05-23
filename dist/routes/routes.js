"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const CategoryController_1 = require("../controllers/CategoryController");
const ProductController_1 = require("../controllers/ProductController");
const PublicController_1 = require("../controllers/PublicController");
const RestaurantController_1 = require("../controllers/RestaurantController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const uploadProductImage_1 = require("../middlewares/uploadProductImage");
const uploadToSupabase_1 = require("../middlewares/uploadToSupabase");
const routes = (0, express_1.Router)();
exports.routes = routes;
const authController = new AuthController_1.AuthController();
const categoryController = new CategoryController_1.CategoryController();
const productController = new ProductController_1.ProductController();
const publicController = new PublicController_1.PublicController();
const restaurantController = new RestaurantController_1.RestaurantController();
const uploadAvatarMiddleware = (0, uploadToSupabase_1.createSupabaseUploadMiddleware)({
    folder: 'avatars',
    fieldName: 'avatar'
});
const uploadLogoMiddleware = (0, uploadToSupabase_1.createSupabaseUploadMiddleware)({
    folder: 'logos',
    fieldName: 'logo'
});
routes.post('/login', authController.login);
routes.post('/categories', authMiddleware_1.authMiddleware, categoryController.create);
routes.get('/categories', authMiddleware_1.authMiddleware, categoryController.index);
routes.put('/categories/:id', authMiddleware_1.authMiddleware, categoryController.update);
routes.delete('/categories/:id', authMiddleware_1.authMiddleware, categoryController.delete);
routes.post('/products', authMiddleware_1.authMiddleware, uploadProductImage_1.uploadProductImage, productController.create);
routes.get('/products', authMiddleware_1.authMiddleware, productController.index);
routes.put('/products/:id', authMiddleware_1.authMiddleware, uploadProductImage_1.uploadProductImage, productController.update);
routes.delete('/products/:id', authMiddleware_1.authMiddleware, productController.delete);
routes.post('/register', authController.register);
// User profile routes (authenticated)
routes.get('/users/me', authMiddleware_1.authMiddleware, authController.me);
routes.put('/users/me', authMiddleware_1.authMiddleware, authController.updateMe);
routes.post('/users/me/avatar', authMiddleware_1.authMiddleware, uploadAvatarMiddleware, authController.uploadAvatar);
// Authenticated restaurant routes for admin automation
routes.get('/restaurants/me', authMiddleware_1.authMiddleware, restaurantController.me);
routes.put('/restaurants/me', authMiddleware_1.authMiddleware, restaurantController.update);
routes.get('/restaurants/me/qr', authMiddleware_1.authMiddleware, restaurantController.myQr);
routes.post('/restaurants/me/logo', authMiddleware_1.authMiddleware, uploadLogoMiddleware, restaurantController.uploadLogo);
routes.post('/restaurants/:id/delivery-area', authMiddleware_1.authMiddleware, restaurantController.setDeliveryArea);
// Public menu routes (no auth)
routes.get('/r/:slug', publicController.show);
routes.get('/r/:slug/qr', publicController.qr);
// Alias routes for backwards compatibility / frontend expectations
routes.get('/restaurants/:slug', publicController.show);
routes.get('/restaurants/:slug/qr', publicController.qr);
