export function resolveMediaUrl(url: string | null | undefined, apiBaseUrl: string): string | null {
  if (!url) {
    return null;
  }

  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  const normalizedBaseUrl = apiBaseUrl.replace(/\/$/, '');
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  return `${normalizedBaseUrl}${normalizedPath}`;
}
