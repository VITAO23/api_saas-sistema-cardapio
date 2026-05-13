"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const CreateProductService_1 = require("../services/product/CreateProductService");
class ProductController {
    async create(req, res) {
        try {
            const service = new CreateProductService_1.CreateProductService();
            const product = await service.execute(req.body);
            return res.status(201).json(product);
        }
        catch (error) {
            return res.status(400).json({
                error: error instanceof Error ? error.message : 'Error'
            });
        }
    }
}
exports.ProductController = ProductController;
