import { prisma } from '../../lib/prisma';

interface IRequest {
  name: string;
  userId: string;
}

export class CreateCategoryService {
  async execute({ name, userId }: IRequest) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.restaurantId) {
      throw new Error('Restaurant not assigned yet');
    }

    return prisma.category.create({
      data: {
        name,
        restaurantId: user.restaurantId
      }
    });
  }
}