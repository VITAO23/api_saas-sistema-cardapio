import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { supabase } from '../lib/supabaseClient';
import { Request, Response, NextFunction } from 'express';

interface SupabaseUploadConfig {
  folder: string;
  fieldName: string;
  maxSize?: number;
  bucket?: string;
}

export function createSupabaseUploadMiddleware(config: SupabaseUploadConfig) {
  const storage = multer.memoryStorage();
  const uploadDir = path.join(process.cwd(), 'uploads', config.folder);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const upload = multer({
    storage,
    limits: { fileSize: config.maxSize ?? 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (allowedMimes.includes(file.mimetype)) cb(null, true);
      else cb(new Error('Only image files are allowed (JPEG, PNG, WebP, GIF)'));
    }
  }).single(config.fieldName);

  return (req: Request, res: Response, next: NextFunction) => {
    upload(req as any, res as any, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: err instanceof Error ? err.message : 'Upload error' });
      }

      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) return next();

      // Build a unique filename and key
      const extension = path.extname(file.originalname).toLowerCase();
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
      const key = `${config.folder}/${fileName}`;
      const bucket = config.bucket ?? config.folder;

      try {
        if (!supabase) throw new Error('Supabase client not initialized');
        if ((process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_KEY ?? '').startsWith('sb_publishable_')) {
          throw new Error('SUPABASE_SERVICE_ROLE_KEY is using a publishable key; set the secret/service_role key in Render');
        }

        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucket);
        if (bucketError || !bucketData) {
          throw new Error(`Bucket "${bucket}" not found in Supabase Storage`);
        }

        const { error: uploadError } = await supabase.storage.from(bucket).upload(key, file.buffer as Buffer, {
          contentType: file.mimetype,
          upsert: false
        });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(bucket).getPublicUrl(key);

        // Replace multer file reference with minimal metadata used by controllers
        (req as any).file = {
          filename: fileName,
          key,
          publicUrl: data.publicUrl,
          mimetype: file.mimetype,
          size: file.size
        };

        return next();
      } catch (uploadErr: any) {
        try {
          const targetPath = path.join(uploadDir, fileName);
          fs.writeFileSync(targetPath, file.buffer as Buffer);

          (req as any).file = {
            filename: fileName,
            key,
            publicUrl: `/uploads/${config.folder}/${fileName}`,
            mimetype: file.mimetype,
            size: file.size
          };

          return next();
        } catch {
          return res.status(500).json({ error: uploadErr?.message ?? 'Failed to upload to Supabase' });
        }
      }
    });
  };
}
