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

    return prisma.category.create({
      data: {
        name,
        restaurantId: user.restaurantId
      }
    });
  }
}