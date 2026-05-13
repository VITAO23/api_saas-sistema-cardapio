import { prisma } from '../../lib/prisma';

interface IRequest {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  restaurantId: string;
}

export class CreateProductService {
  async execute(data: IRequest) {
    return prisma.product.create({
      data
    });
  }
}