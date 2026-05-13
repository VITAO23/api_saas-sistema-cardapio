import { Request, Response } from 'express';
import { LoginService } from '../services/auth/LoginService';
import { CreateUserService } from '../services/auth/CreateUserService';
import { LoginSchema, RegisterSchema } from '../schemas/validations';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const parsed = LoginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.flatten() });
      }

      const { email, password } = parsed.data;

      const service = new LoginService();

      const result = await service.execute(email, password);

      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Error'
      });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const parsed = RegisterSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.flatten() });
      }

      const { name, email, password, restaurantId } = parsed.data;

      const service = new CreateUserService();

      const user = await service.execute({
        name,
        email,
        password,
        restaurantId
      });

      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Error'
      });
    }
  }
}