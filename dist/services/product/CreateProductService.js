"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductService = void 0;
const prisma_1 = require("../../lib/prisma");
class CreateProductService {
    async execute(data) {
        return prisma_1.prisma.product.create({
            data
        });
    }
}
exports.CreateProductService = CreateProductService;
