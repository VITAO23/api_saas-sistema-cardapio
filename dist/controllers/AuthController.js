"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const LoginService_1 = require("../services/auth/LoginService");
class AuthController {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const service = new LoginService_1.LoginService();
            const result = await service.execute(email, password);
            return res.json(result);
        }
        catch (error) {
            return res.status(400).json({
                error: error instanceof Error ? error.message : 'Error'
            });
        }
    }
}
exports.AuthController = AuthController;
