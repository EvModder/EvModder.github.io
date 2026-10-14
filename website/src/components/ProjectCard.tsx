import { useState } from "react";
import { Star, GitFork, ExternalLink, Tag, Check } from "lucide-react";
import type { Project } from "@/data/projects";
import type { RepoStats } from "@/hooks/useGitHubStats";
import { LinkIcon } from "@/components/LinkIcon";
import bashIcon from "@/assets/languages/bash.svg";
import cIcon from "@/assets/languages/c.svg";
import cppIcon from "@/assets/languages/c-plusplus.svg";
import javaIcon from "@/assets/languages/java.svg";
import typescriptIcon from "@/assets/languages/typescript.svg";

const languageIcons: Record<Project["language"], string> = {
  "C": cIcon,
  "C++": cppIcon,
  "Java": javaIcon,
  "Shell": bashIcon,
  "TypeScript": typescriptIcon,
};

const linkTitles: Record<string, string> = {
  "Add-ons": "View add-ons",
  "Bukkit": "View on Bukkit.org",
  "API Docs": "Browse API documentation",
  "Docs": "Browse documentation",
  "PNG → NBT": "Open PNG → NBT converter",
  "Play": "Play online",
  "MapArt Tools": "Open MapArt Tools",
  "Modrinth": "View on Modrinth",
};

interface Props {
  project: Project;
  stats?: RepoStats;
}

export function ProjectCard({ project, stats }: Props) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const stars = stats?.stars ?? project.stars;
  const forks = stats?.forks ?? project.forks;
  const topics = stats?.topics ?? project.topics;

  return (
    <article className="bg-card rounded-lg p-5 card-hover pixel-border group">
      <a href={project.url} target="_blank" rel="noopener noreferrer" className="block" title={`View ${project.name} on GitHub`}>
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          <ExternalLink className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">{project.description}</p>
      </a>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1.5">
          <img
            src={languageIcons[project.language]}
            alt=""
            width={18}
            height={18}
            className={`-m-0.5 size-[18px] object-contain${project.language === "Shell" ? " language-icon-shell" : ""}`}
          />
          {project.language}
        </span>
        {stars > 0 && (
          <span className="flex items-center gap-1">
            <Star className="size-3.5" />
            {stars}
          </span>
        )}
        {forks > 0 && (
          <span className="flex items-center gap-1">
            <GitFork className="size-3.5" />
            {forks}
          </span>
        )}
      </div>

      {!!(project.subLinks?.length || project.labels?.length) && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
          {project.subLinks?.map(link => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={linkTitles[link.label] ?? `Open ${link.label} for ${project.name}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-display font-medium bg-secondary text-primary rounded hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <LinkIcon name={link.label} className="size-3.5 shrink-0" />
              {link.label}
            </a>
          ))}
          {project.labels?.map(label => {
            const value = label.replace(/^[^:]+:\s*/, "");
            return (
              <button
                type="button"
                key={label}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-display font-medium bg-secondary rounded cursor-pointer transition-colors"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(value);
                    setCopiedValue(value);
                    setTimeout(() => setCopiedValue(v => v === value ? null : v), 1500);
                  } catch {
                    // Keep the label unchanged if the browser rejects copying.
                  }
                }}
                title={copiedValue === value ? "Copied!" : `Click to copy: ${value}`}
              >
                {copiedValue === value ? (
                  <>
                    <Check className="size-3 text-primary" />
                    <span className="text-primary">IP copied!</span>
                  </>
                ) : (
                  <>
                    <Tag className="size-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{label}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      )}

      {topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {topics.slice(0, 6).map(topic => (
            <span
              key={topic}
              className="px-2 py-0.5 text-[10px] font-display bg-secondary text-muted-foreground rounded"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
