import { Request, Response } from 'express';
import { CreateCategoryService } from '../services/category/CreateCategoryService';
import { ListCategoriesService } from '../services/category/ListCategoriesService';

export class CategoryController {
  async create(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const userId = req.userId;

      const service = new CreateCategoryService();

      const category = await service.execute({
        name,
        userId
      });

      return res.status(201).json(category);
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Error'
      });
    }
  }

  async index(req: Request, res: Response) {
    try {
      const userId = req.userId;

      const service = new ListCategoriesService();

      const categories = await service.execute(userId);

      return res.json(categories);
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Error'
      });
    }
  }
}