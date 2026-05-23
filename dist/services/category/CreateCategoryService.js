"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCategoryService = void 0;
const prisma_1 = require("../../lib/prisma");
class CreateCategoryService {
    async execute({ name, userId }) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.restaurantId) {
            throw new Error('Restaurant not assigned yet');
        }
        return prisma_1.prisma.category.create({
            data: {
                name,
                restaurantId: user.restaurantId
            }
        });
    }
}
exports.CreateCategoryService = CreateCategoryService;
