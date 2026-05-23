"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const CreateCategoryService_1 = require("../services/category/CreateCategoryService");
const ListCategoriesService_1 = require("../services/category/ListCategoriesService");
const UpdateCategoryService_1 = require("../services/category/UpdateCategoryService");
const DeleteCategoryService_1 = require("../services/category/DeleteCategoryService");
const validations_1 = require("../schemas/validations");
class CategoryController {
    async create(req, res) {
        try {
            const parsed = validations_1.CreateCategorySchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ errors: parsed.error.flatten() });
            }
            const { name } = parsed.data;
            const userId = String(req.userId);
            const service = new CreateCategoryService_1.CreateCategoryService();
            const category = await service.execute({
                name,
                userId
            });
            return res.status(201).json(category);
        }
        catch (error) {
            return res.status(400).json({
                error: error instanceof Error ? error.message : 'Error'
            });
        }
    }
    async index(req, res) {
        try {
            const userId = req.userId;
            const service = new ListCategoriesService_1.ListCategoriesService();
            const categories = await service.execute(userId);
            return res.json(categories);
        }
        catch (error) {
            return res.status(400).json({
                error: error instanceof Error ? error.message : 'Error'
            });
        }
    }
    async update(req, res) {
        try {
            const parsed = validations_1.UpdateCategorySchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ errors: parsed.error.flatten() });
            }
            const id = String(req.params.id);
            const { name } = parsed.data;
            const userId = String(req.userId);
            const service = new UpdateCategoryService_1.UpdateCategoryService();
            const category = await service.execute({ id, name: name || undefined, userId });
            return res.json(category);
        }
        catch (error) {
            return res.status(400).json({ error: error instanceof Error ? error.message : 'Error' });
        }
    }
    async delete(req, res) {
        try {
            const id = String(req.params.id);
            const userId = String(req.userId);
            const service = new DeleteCategoryService_1.DeleteCategoryService();
            await service.execute(id, userId);
            return res.status(204).send();
        }
        catch (error) {
            return res.status(400).json({ error: error instanceof Error ? error.message : 'Error' });
        }
    }
}
exports.CategoryController = CategoryController;
