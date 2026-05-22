import { prisma } from '../../lib/prisma';

export class ListCategoriesService {
  async execute(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.restaurantId) {
      return [];
    }

    return prisma.category.findMany({ where: { restaurantId: user.restaurantId } });
  }
}
