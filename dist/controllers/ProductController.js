"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const CreateProductService_1 = require("../services/product/CreateProductService");
const ListProductsService_1 = require("../services/product/ListProductsService");
const UpdateProductService_1 = require("../services/product/UpdateProductService");
const DeleteProductService_1 = require("../services/product/DeleteProductService");
const validations_1 = require("../schemas/validations");
function buildImageUrl(fileName) {
    if (!fileName) {
        return undefined;
    }
    return `/uploads/products/${fileName}`;
}
function parseOptionGroups(value) {
    if (typeof value !== 'string') {
        return value;
    }
    try {
        return JSON.parse(value);
    }
    catch {
        return value;
    }
}
class ProductController {
    async create(req, res) {
        try {
            const requestWithFile = req;
            const parsed = validations_1.CreateProductSchema.safeParse({
                ...req.body,
                optionGroups: parseOptionGroups(req.body.optionGroups)
            });
            if (!parsed.success) {
                return res.status(400).json({ errors: parsed.error.flatten() });
            }
            const service = new CreateProductService_1.CreateProductService();
            const imageUrl = buildImageUrl(requestWithFile.file?.filename) ?? parsed.data.imageUrl;
            const productPayload = {
                ...parsed.data,
                userId: String(req.userId),
                ...(imageUrl !== undefined ? { imageUrl } : {})
            };
            const product = await service.execute(productPayload);
            return res.status(201).json(product);
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
            const service = new ListProductsService_1.ListProductsService();
            const products = await service.execute(userId);
            return res.json(products);
        }
        catch (error) {
            return res.status(400).json({
                error: error instanceof Error ? error.message : 'Error'
            });
        }
    }
    async update(req, res) {
        try {
            const requestWithFile = req;
            const parsed = validations_1.UpdateProductSchema.safeParse({
                ...req.body,
                optionGroups: parseOptionGroups(req.body.optionGroups)
            });
            if (!parsed.success) {
                return res.status(400).json({ errors: parsed.error.flatten() });
            }
            const id = String(req.params.id);
            const userId = String(req.userId);
            const service = new UpdateProductService_1.UpdateProductService();
            const imageUrl = buildImageUrl(requestWithFile.file?.filename) ?? parsed.data.imageUrl;
            const { optionGroups, imageUrl: parsedImageUrl, ...rest } = parsed.data;
            const productPayload = {
                id,
                userId,
                ...rest,
                ...(optionGroups !== undefined ? { optionGroups } : {}),
                ...(imageUrl !== undefined ? { imageUrl } : {})
            };
            const product = await service.execute(productPayload);
            return res.json(product);
        }
        catch (error) {
            return res.status(400).json({ error: error instanceof Error ? error.message : 'Error' });
        }
    }
    async delete(req, res) {
        try {
            const id = String(req.params.id);
            const userId = String(req.userId);
            const service = new DeleteProductService_1.DeleteProductService();
            await service.execute(id, userId);
            return res.status(204).send();
        }
        catch (error) {
            return res.status(400).json({ error: error instanceof Error ? error.message : 'Error' });
        }
    }
}
exports.ProductController = ProductController;
