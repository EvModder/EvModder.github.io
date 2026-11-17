// Live one-line descriptions for mod links, fetched from the linked GitHub repo or Modrinth project on first
// hover and cached for the browser session, so the site stores no description text of its own.
// Callers: MinecraftSetup.tsx (mod link tooltips).
const CACHE_KEY = "setup:descriptions";

const cache: Record<string, string> = (() => {
  try { return JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? "{}"); } catch { return {}; }
})();
const pending = new Map<string, Promise<string>>();

function apiUrl(url: string) {
  const github = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)/);
  if (github) return `https://api.github.com/repos/${github[1]}/${github[2]}`;
  const modrinth = url.match(/^https:\/\/modrinth\.com\/(?:mod|resourcepack)\/([^/]+)/);
  if (modrinth) return `https://api.modrinth.com/v2/project/${modrinth[1]}`;
}

// Resolves to "" when the host is unsupported, the request fails, or the project has no description.
export function projectDescription(url: string): Promise<string> {
  if (url in cache) return Promise.resolve(cache[url]);
  let request = pending.get(url);
  if (!request) {
    const api = apiUrl(url);
    request = (api ? fetch(api, { signal: AbortSignal.timeout(8_000) }) : Promise.reject())
      .then(res => res.ok ? res.json() as Promise<{ description?: string | null }> : Promise.reject())
      .then(({ description }) => {
        cache[url] = description?.trim() ?? "";
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch { /* storage unavailable */ }
        return cache[url];
      })
      .catch(() => "")
      .finally(() => pending.delete(url));
    pending.set(url, request);
  }
  return request;
}
