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

function trimTrailingSlash(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function isSupabaseStorageUrl(rawUrl: string) {
  try {
    const parsedUrl = new URL(rawUrl);
    return (
      parsedUrl.hostname.endsWith('.supabase.co') ||
      parsedUrl.hostname === 'supabase.co' ||
      parsedUrl.hostname.endsWith('.supabase.in') ||
      parsedUrl.hostname === 'supabase.in'
    );
  } catch {
    return false;
  }
}

export function resolvePublicAssetUrl(assetUrl?: string | null) {
  if (!assetUrl) {
    return assetUrl ?? undefined;
  }

  const trimmedUrl = assetUrl.trim();

  if (!trimmedUrl) {
    return undefined;
  }

  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    if (isSupabaseStorageUrl(trimmedUrl)) {
      // Public Supabase buckets do not require proxying; returning direct URL avoids
      // frontend/private-network issues when proxy origin is misconfigured.
      if (process.env.USE_ASSET_PROXY === 'true') {
        const proxyBase = trimTrailingSlash(getPublicAssetOrigin());
        return `${proxyBase}/assets/proxy?url=${encodeURIComponent(trimmedUrl)}`;
      }

      return trimmedUrl;
    }

    try {
      const publicOrigin = new URL(getPublicAssetOrigin());
      const parsedUrl = new URL(trimmedUrl);

      if (parsedUrl.origin === publicOrigin.origin) {
        return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
      }
    } catch {
      // Keep falling through to the original URL when we cannot normalize it.
    }

    return trimmedUrl;
  }

  const normalizedPath = trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`;
  return normalizedPath;
}
