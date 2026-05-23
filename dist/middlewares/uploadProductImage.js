"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProductImage = uploadProductImage;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const uploadDirectory = path_1.default.join(process.cwd(), 'uploads', 'products');
fs_1.default.mkdirSync(uploadDirectory, { recursive: true });
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, uploadDirectory);
    },
    filename: (_req, file, callback) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const extension = path_1.default.extname(file.originalname).toLowerCase();
        callback(null, `${uniqueSuffix}${extension}`);
    }
});
const fileFilter = (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
        return callback(new Error('Apenas arquivos de imagem são permitidos'));
    }
    return callback(null, true);
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
function uploadProductImage(req, res, next) {
    upload.single('image')(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                error: error instanceof Error ? error.message : 'Erro no upload da imagem'
            });
        }
        return next();
    });
}
