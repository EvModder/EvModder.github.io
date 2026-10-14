import { useEffect, useState } from "react";

export interface RepoStats {
  stars: number;
  forks: number;
  topics: string[];
}
type RepoStatsMap = Record<string, RepoStats>;
interface CachedStats { data: RepoStatsMap; ts: number; }
interface GitHubRepo {
  name: string;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
}

const CACHE_KEY = "gh_stats_cache";
const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const readCache = (): CachedStats | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw) as CachedStats;
    return cache && Number.isFinite(cache.ts) && cache.data ? cache : null;
  } catch {
    return null;
  }
};

export function useGitHubStats() {
  const [cache] = useState(readCache);
  const [stats, setStats] = useState<RepoStatsMap>(() =>
    cache && Date.now() - cache.ts <= CACHE_MAX_AGE_MS ? cache.data : {});

  useEffect(() => {
    if (cache && Date.now() - cache.ts < CACHE_TTL_MS) return;
    const controller = new AbortController();
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]);
    (async () => {
      try {
        const next: RepoStatsMap = {};
        for (let page = 1; ; ++page) {
          const res = await fetch(`https://api.github.com/users/EvModder/repos?per_page=100&page=${page}`, {
            signal,
            headers: {
              Accept: "application/vnd.github+json",
              "X-GitHub-Api-Version": "2026-03-10",
            },
          });
          if (!res.ok) return;
          for (const { name, stargazers_count: stars, forks_count: forks, topics } of await res.json() as GitHubRepo[])
            next[name] = { stars, forks, topics };
          if (!res.headers.get("Link")?.includes('rel="next"')) break;
        }
        setStats(next);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: next, ts: Date.now() }));
      } catch {
        // Silently fail and keep local defaults/cached values.
      }
    })();
    return () => controller.abort();
  }, [cache]);

  return stats;
}
