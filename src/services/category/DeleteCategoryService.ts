import { prisma } from '../../lib/prisma';

export class DeleteCategoryService {
  async execute(id: string, userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new Error('User not found');

    const category = await prisma.category.findUnique({ where: { id } });

    if (!category || category.restaurantId !== user.restaurantId) {
      throw new Error('Category not found');
    }

    return prisma.category.delete({ where: { id } });
  }
}
