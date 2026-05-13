import { Request, Response } from 'express';
import { LoginService } from '../services/auth/LoginService';
import { CreateUserService } from '../services/auth/CreateUserService';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

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
      const { name, email, password, restaurantId } = req.body;

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