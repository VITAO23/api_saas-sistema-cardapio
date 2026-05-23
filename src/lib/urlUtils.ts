export function getPublicOrigin() {
  const corsOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return process.env.PUBLIC_ORIGIN ?? corsOrigins[0] ?? `http://localhost:${process.env.PORT ?? 3333}`;
}

export function getPublicAssetOrigin() {
  return process.env.ASSET_PUBLIC_ORIGIN ?? getPublicOrigin();
}

export function resolvePublicAssetUrl(assetUrl?: string | null) {
  if (!assetUrl) {
    return assetUrl ?? undefined;
  }

  if (assetUrl.startsWith('http://') || assetUrl.startsWith('https://')) {
    return assetUrl;
  }

  const normalizedPath = assetUrl.startsWith('/') ? assetUrl : `/${assetUrl}`;
  return `${getPublicAssetOrigin()}${normalizedPath}`;
}
