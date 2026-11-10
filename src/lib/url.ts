/** Resolve a path inside the configured Astro base path. */
export function withBase(path = ''): string {
  const base = import.meta.env.BASE_URL;
  const clean = path.replace(/^\//, '');
  return `${base}${clean}`.replace(/\/{2,}/g, '/');
}
