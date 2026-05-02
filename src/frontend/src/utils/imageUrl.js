export function resolveImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/uploads/')) {
    return path;
  }

  return `/uploads/${path.replace(/^\/+/, '')}`;
}
