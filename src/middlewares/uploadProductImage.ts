import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { NextFunction, Request, Response } from 'express';

const uploadDirectory = path.join(process.cwd(), 'uploads', 'products');

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (_req, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname).toLowerCase();

    callback(null, `${uniqueSuffix}${extension}`);
  }
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, callback) => {
  if (!file.mimetype.startsWith('image/')) {
    return callback(new Error('Apenas arquivos de imagem são permitidos'));
  }

  return callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export function uploadProductImage(req: Request, res: Response, next: NextFunction) {
  upload.single('image')(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro no upload da imagem'
      });
    }

    return next();
  });
}