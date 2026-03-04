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
  stargazers_count?: number;
  forks_count?: number;
  topics?: string[];
}

const CACHE_KEY = "gh_stats_cache";
const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const readCache = (): CachedStats | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedStats;
  } catch {
    return null;
  }
};

const cachedStats = (): RepoStatsMap => {
  const cache = readCache();
  if (!cache || Date.now() - cache.ts > CACHE_MAX_AGE_MS) return {};
  return cache.data ?? {};
};

const saveCachedStats = (data: RepoStatsMap) => {
  try {
    const payload: CachedStats = { data, ts: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {}
};

const hasFreshCache = () => {
  const cache = readCache();
  return !!cache && Date.now() - cache.ts < CACHE_TTL_MS;
};

export function useGitHubStats() {
  const [stats, setStats] = useState<RepoStatsMap>(cachedStats);

  useEffect(() => {
    if (hasFreshCache()) return;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("https://api.github.com/users/EvModder/repos?per_page=100", {
          signal: controller.signal,
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!res.ok) return;
        const repos = await res.json() as GitHubRepo[];
        const map: RepoStatsMap = {};
        for (const repo of repos) {
          map[repo.name] = {
            stars: repo.stargazers_count ?? 0,
            forks: repo.forks_count ?? 0,
            topics: repo.topics || [],
          };
        }
        setStats(map);
        saveCachedStats(map);
      } catch {
        // Silently fail and keep local defaults/cached values.
      }
    })();
    return () => controller.abort();
  }, []);

  return stats;
}
