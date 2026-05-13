"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const CreateCategoryService_1 = require("../services/category/CreateCategoryService");
class CategoryController {
    async create(req, res) {
        try {
            const { name, restaurantId } = req.body;
            const service = new CreateCategoryService_1.CreateCategoryService();
            const category = await service.execute({
                name,
                restaurantId
            });
            return res.status(201).json(category);
        }
        catch (error) {
            return res.status(400).json({
                error: error instanceof Error ? error.message : 'Error'
            });
        }
    }
}
exports.CategoryController = CategoryController;
