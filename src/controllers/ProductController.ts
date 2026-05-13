import { Request, Response } from 'express';
import { CreateProductService } from '../services/product/CreateProductService';

export class ProductController {
  async create(req: Request, res: Response) {
    try {
      const service = new CreateProductService();

      const product = await service.execute({
        ...req.body,
        userId: req.userId
      });

      return res.status(201).json(product);
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Error'
      });
    }
  }
}