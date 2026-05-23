"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupabaseUploadMiddleware = createSupabaseUploadMiddleware;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const supabaseClient_1 = require("../lib/supabaseClient");
function createSupabaseUploadMiddleware(config) {
    const storage = multer_1.default.memoryStorage();
    const upload = (0, multer_1.default)({
        storage,
        limits: { fileSize: config.maxSize ?? 5 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (allowedMimes.includes(file.mimetype))
                cb(null, true);
            else
                cb(new Error('Only image files are allowed (JPEG, PNG, WebP, GIF)'));
        }
    }).single(config.fieldName);
    return (req, res, next) => {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err instanceof Error ? err.message : 'Upload error' });
            }
            const file = req.file;
            if (!file)
                return next();
            // Build a unique filename and key
            const extension = path_1.default.extname(file.originalname).toLowerCase();
            const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
            const key = `${config.folder}/${fileName}`;
            const bucket = config.bucket ?? config.folder;
            try {
                if (!supabaseClient_1.supabase)
                    throw new Error('Supabase client not initialized');
                const { data: bucketData, error: bucketError } = await supabaseClient_1.supabase.storage.getBucket(bucket);
                if (bucketError || !bucketData) {
                    throw new Error(`Bucket "${bucket}" not found in Supabase Storage`);
                }
                const { error: uploadError } = await supabaseClient_1.supabase.storage.from(bucket).upload(key, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });
                if (uploadError)
                    throw uploadError;
                const { data } = supabaseClient_1.supabase.storage.from(bucket).getPublicUrl(key);
                // Replace multer file reference with minimal metadata used by controllers
                req.file = {
                    filename: fileName,
                    key,
                    publicUrl: data.publicUrl,
                    mimetype: file.mimetype,
                    size: file.size
                };
                return next();
            }
            catch (uploadErr) {
                return res.status(500).json({ error: uploadErr?.message ?? 'Failed to upload to Supabase' });
            }
        });
    };
}
