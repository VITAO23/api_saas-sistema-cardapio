"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicOrigin = getPublicOrigin;
exports.getPublicAssetOrigin = getPublicAssetOrigin;
exports.resolvePublicAssetUrl = resolvePublicAssetUrl;
function getPublicOrigin() {
    const corsOrigins = (process.env.CORS_ORIGINS ?? '')
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0);
    return process.env.PUBLIC_ORIGIN ?? corsOrigins[0] ?? `http://localhost:${process.env.PORT ?? 3333}`;
}
function getPublicAssetOrigin() {
    return process.env.ASSET_PUBLIC_ORIGIN ?? getPublicOrigin();
}
function resolvePublicAssetUrl(assetUrl) {
    if (!assetUrl) {
        return assetUrl ?? undefined;
    }
    if (assetUrl.startsWith('http://') || assetUrl.startsWith('https://')) {
        return assetUrl;
    }
    const normalizedPath = assetUrl.startsWith('/') ? assetUrl : `/${assetUrl}`;
    return `${getPublicAssetOrigin()}${normalizedPath}`;
}
