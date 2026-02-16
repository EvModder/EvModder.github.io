import { useEffect, useState } from "react";

interface RepoStats {
  stars: number;
  forks: number;
  topics: string[];
  description: string;
}

const CACHE_KEY = "gh_stats_cache";
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

export function useGitHubStats(repoNames: string[]) {
  const [stats, setStats] = useState<Record<string, RepoStats>>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) return data;
      }
    } catch {}
    return {};
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          "https://api.github.com/users/EvModder/repos?per_page=100"
        );
        if (!res.ok) return;
        const repos: Array<{ name: string; stargazers_count: number; forks_count: number; topics: string[]; description: string }> =
          await res.json();
        const map: Record<string, RepoStats> = {};
        for (const repo of repos) {
          map[repo.name] = {
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            topics: repo.topics || [],
            description: repo.description || "",
          };
        }
        setStats(map);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: map, ts: Date.now() })
        );
      } catch {
        // silently fail, use defaults
      }
    };
    fetchStats();
  }, []);

  return stats;
}
