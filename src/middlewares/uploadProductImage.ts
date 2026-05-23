import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { NextFunction, Request, Response } from 'express';

const uploadDirectory = path.join(process.cwd(), 'uploads', 'products');

fs.mkdirSync(uploadDirectory, { recursive: true });

// Use memory storage so we can optionally upload to Supabase Storage
const memoryStorage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, callback) => {
  if (!file.mimetype.startsWith('image/')) {
    return callback(new Error('Apenas arquivos de imagem são permitidos'));
  }

  return callback(null, true);
};

const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export function uploadProductImage(req: Request, res: Response, next: NextFunction) {
  upload.single('image')(req as any, res as any, async (error: any) => {
    if (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro no upload da imagem'
      });
    }

    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) return next();

    // If Supabase is configured, upload to storage, otherwise fallback to disk
    if (process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY)) {
      try {
        // lazy import to avoid requiring supabase client when not configured
        const { supabase } = await import('../lib/supabaseClient');
        if (!supabase) {
          throw new Error('Supabase not configured');
        }

        const extension = path.extname(file.originalname).toLowerCase();
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        const key = `products/${fileName}`;
        const bucket = process.env.SUPABASE_BUCKET ?? 'uploads';

        const { error: uploadError } = await supabase.storage.from(bucket).upload(key, file.buffer as Buffer, {
          contentType: file.mimetype,
          upsert: false
        });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(bucket).getPublicUrl(key);

        (req as any).file = {
          filename: fileName,
          key,
          publicUrl: data.publicUrl,
          mimetype: file.mimetype,
          size: file.size
        };

        return next();
      } catch (e: any) {
        return res.status(500).json({ error: e?.message ?? 'Falha ao enviar imagem para Supabase' });
      }
    }

    // Fallback: persist to disk (existing behavior)
    try {
      const extension = path.extname(file.originalname).toLowerCase();
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
      const targetPath = path.join(uploadDirectory, fileName);
      fs.writeFileSync(targetPath, file.buffer as Buffer);
      (req as any).file = {
        filename: fileName,
        path: targetPath,
        mimetype: file.mimetype,
        size: file.size
      };

      return next();
    } catch (e: any) {
      return res.status(500).json({ error: e?.message ?? 'Falha ao salvar arquivo localmente' });
    }
  });
}