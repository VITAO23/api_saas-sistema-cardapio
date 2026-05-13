import { Request, Response } from 'express';
import { CreateProductService } from '../services/product/CreateProductService';
import { ListProductsService } from '../services/product/ListProductsService';
import { UpdateProductService } from '../services/product/UpdateProductService';
import { DeleteProductService } from '../services/product/DeleteProductService';
import { CreateProductSchema, UpdateProductSchema } from '../schemas/validations';

export class ProductController {
  async create(req: Request, res: Response) {
    try {
      const parsed = CreateProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.flatten() });
      }

      const service = new CreateProductService();

      const product = await service.execute({
        ...parsed.data,
        userId: String(req.userId)
      });

      return res.status(201).json(product);
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Error'
      });
    }
  }

  async index(req: Request, res: Response) {
    try {
      const userId = req.userId;

      const service = new ListProductsService();

      const products = await service.execute(userId);

      return res.json(products);
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Error'
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const parsed = UpdateProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.flatten() });
      }

      const id = String(req.params.id);
      const userId = String(req.userId);

      const service = new UpdateProductService();

      const product = await service.execute({ id, userId, ...parsed.data });

      return res.json(product);
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : 'Error' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const userId = String(req.userId);

      const service = new DeleteProductService();

      await service.execute(id, userId);

      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : 'Error' });
    }
  }
}