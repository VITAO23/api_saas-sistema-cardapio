import { prisma } from '../../lib/prisma';

export class ListProductsService {
  async execute(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    return prisma.product.findMany({
      where: { restaurantId: user.restaurantId },
      include: { category: true }
    });
  }
}
