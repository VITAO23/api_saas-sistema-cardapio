import { Request, Response } from 'express';
import { CreateCategoryService } from '../services/category/CreateCategoryService';
import { ListCategoriesService } from '../services/category/ListCategoriesService';
import { UpdateCategoryService } from '../services/category/UpdateCategoryService';
import { DeleteCategoryService } from '../services/category/DeleteCategoryService';
import { CreateCategorySchema, UpdateCategorySchema } from '../schemas/validations';

export class CategoryController {
  async create(req: Request, res: Response) {
    try {
      const parsed = CreateCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.flatten() });
      }

      const { name } = parsed.data;
      const userId = String(req.userId);

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

  async update(req: Request, res: Response) {
    try {
      const parsed = UpdateCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.flatten() });
      }

      const id = String(req.params.id);
      const { name } = parsed.data;
      const userId = String(req.userId);

      const service = new UpdateCategoryService();

      const category = await service.execute({ id, name: name || undefined, userId });

      return res.json(category);
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : 'Error' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const userId = String(req.userId);

      const service = new DeleteCategoryService();

      await service.execute(id, userId);

      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : 'Error' });
    }
  }
}