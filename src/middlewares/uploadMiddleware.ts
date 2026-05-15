import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';

interface UploadConfig {
  folder: string;
  fieldName: string;
  maxSize?: number; // in bytes, default 5MB
}

export function createUploadMiddleware(config: UploadConfig) {
  const uploadDir = path.join(process.cwd(), 'uploads', config.folder);

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage: StorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const fileFilter = (
    req: any,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, WebP, GIF)'));
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: config.maxSize || 5 * 1024 * 1024 // 5MB default
    }
  }).single(config.fieldName);
}
