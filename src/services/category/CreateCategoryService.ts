import { prisma } from '../../lib/prisma';

interface IRequest {
  name: string;
  restaurantId: string;
}

export class CreateCategoryService {
  async execute({ name, restaurantId }: IRequest) {
    return prisma.category.create({
      data: {
        name,
        restaurantId
      }
    });
  }
}