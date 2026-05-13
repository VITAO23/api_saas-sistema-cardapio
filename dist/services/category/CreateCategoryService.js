"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCategoryService = void 0;
const prisma_1 = require("../../lib/prisma");
class CreateCategoryService {
    async execute({ name, restaurantId }) {
        return prisma_1.prisma.category.create({
            data: {
                name,
                restaurantId
            }
        });
    }
}
exports.CreateCategoryService = CreateCategoryService;
