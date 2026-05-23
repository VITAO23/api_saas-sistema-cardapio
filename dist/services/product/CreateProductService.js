"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductService = void 0;
const prisma_1 = require("../../lib/prisma");
class CreateProductService {
    async execute({ userId, categoryId, optionGroups = [], ...data }) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.restaurantId) {
            throw new Error('Restaurant not assigned yet');
        }
        const category = await prisma_1.prisma.category.findFirst({
            where: {
                id: categoryId,
                restaurantId: user.restaurantId
            }
        });
        if (!category) {
            throw new Error('Category not found');
        }
        return prisma_1.prisma.product.create({
            data: {
                ...data,
                categoryId,
                restaurantId: user.restaurantId,
                optionGroups: {
                    create: optionGroups.map((group) => ({
                        name: group.name,
                        multiple: group.multiple ?? false,
                        required: group.required ?? false,
                        options: {
                            create: (group.options ?? []).map((option) => ({
                                name: option.name,
                                price: option.price ?? null
                            }))
                        }
                    }))
                }
            },
            include: {
                optionGroups: {
                    include: {
                        options: true
                    }
                }
            }
        });
    }
}
exports.CreateProductService = CreateProductService;
