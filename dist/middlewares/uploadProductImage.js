"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
// Use memory storage so we can optionally upload to Supabase Storage
const memoryStorage = multer_1.default.memoryStorage();
const fileFilter = (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
        return callback(new Error('Apenas arquivos de imagem são permitidos'));
    }
    return callback(null, true);
};
const upload = (0, multer_1.default)({
    storage: memoryStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});
function uploadProductImage(req, res, next) {
    upload.single('image')(req, res, async (error) => {
        if (error) {
            return res.status(400).json({
                error: error instanceof Error ? error.message : 'Erro no upload da imagem'
            });
        }
        const file = req.file;
        if (!file)
            return next();
        // If Supabase is configured, upload to storage, otherwise fallback to disk
        if (process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY)) {
            try {
                // lazy import to avoid requiring supabase client when not configured
                const { supabase } = await Promise.resolve().then(() => __importStar(require('../lib/supabaseClient')));
                const extension = path_1.default.extname(file.originalname).toLowerCase();
                const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
                const key = `products/${fileName}`;
                const bucket = process.env.SUPABASE_BUCKET ?? 'uploads';
                const { error: uploadError } = await supabase.storage.from(bucket).upload(key, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });
                if (uploadError)
                    throw uploadError;
                const { data } = supabase.storage.from(bucket).getPublicUrl(key);
                req.file = {
                    filename: fileName,
                    key,
                    publicUrl: data.publicUrl,
                    mimetype: file.mimetype,
                    size: file.size
                };
                return next();
            }
            catch (e) {
                return res.status(500).json({ error: e?.message ?? 'Falha ao enviar imagem para Supabase' });
            }
        }
        // Fallback: persist to disk (existing behavior)
        try {
            const extension = path_1.default.extname(file.originalname).toLowerCase();
            const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
            const targetPath = path_1.default.join(uploadDirectory, fileName);
            fs_1.default.writeFileSync(targetPath, file.buffer);
            req.file = {
                filename: fileName,
                path: targetPath,
                mimetype: file.mimetype,
                size: file.size
            };
            return next();
        }
        catch (e) {
            return res.status(500).json({ error: e?.message ?? 'Falha ao salvar arquivo localmente' });
        }
    });
}
