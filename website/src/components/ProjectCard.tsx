import { useState } from "react";
import { Star, GitFork, ExternalLink, Tag, Check } from "lucide-react";
import type { Project } from "@/data/projects";
import type { RepoStats } from "@/hooks/useGitHubStats";
import { LinkIcon } from "@/components/LinkIcon";
import bashIcon from "@/assets/languages/bash.svg";
import cIcon from "@/assets/languages/c.svg";
import cppIcon from "@/assets/languages/c-plusplus.svg";
import javaIcon from "@/assets/languages/java.svg";

const languageIcons: Record<Project["language"], string> = {
  C: cIcon,
  "C++": cppIcon,
  Java: javaIcon,
  Shell: bashIcon,
};

const linkTitles: Record<string, string> = {
  "Add-ons": "View add-ons",
  "Bukkit": "View on Bukkit.org",
  "API Docs": "Browse API documentation",
  "Docs": "Browse documentation",
  "PNG → NBT": "Open PNG → NBT converter",
  "Play": "Play online",
  "MapArt Tools": "Open MapArt Tools",
  "Modrinth": "View on Modrinth"
};

function getLinkTitle(label: string, projectName: string) {
  return linkTitles[label] || `Open ${label} for ${projectName}`;
}

interface Props {
  project: Project;
  stats?: RepoStats;
}

export function ProjectCard({ project, stats }: Props) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const stars = stats?.stars ?? project.stars;
  const forks = stats?.forks ?? project.forks;
  const topics = stats?.topics?.length ? stats.topics : project.topics;
  const hasSubLinks = !!project.subLinks?.length;
  const hasLabels = !!project.labels?.length;

  return (
    <article className="bg-card rounded-lg p-5 card-hover pixel-border group">
      <a href={project.url} target="_blank" rel="noopener noreferrer" className="block" title={`View ${project.name} on GitHub`}>
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">{project.description}</p>
      </a>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1.5">
          <img
            src={languageIcons[project.language]}
            alt=""
            className={`-m-0.5 h-[18px] w-[18px] object-contain${project.language === "Shell" ? " language-icon-shell" : ""}`}
          />
          {project.language}
        </span>
        {stars > 0 && (
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5" />
            {stars}
          </span>
        )}
        {forks > 0 && (
          <span className="flex items-center gap-1">
            <GitFork className="w-3.5 h-3.5" />
            {forks}
          </span>
        )}
      </div>

      {/* Sub-links and labels */}
      {(hasSubLinks || hasLabels) && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
          {project.subLinks?.map(link => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={getLinkTitle(link.label, project.name)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-display font-medium bg-secondary text-primary rounded hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <LinkIcon name={link.label} className="w-3.5 h-3.5 shrink-0" />
              {link.label}
            </a>
          ))}
          {project.labels?.map(label => {
            const value = label.replace(/^[^:]+:\s*/, "");
            return (
              <span
                key={label}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-display font-medium bg-secondary rounded cursor-pointer transition-colors"
                onClick={e => {
                  e.preventDefault();
                  void navigator.clipboard.writeText(value);
                  setCopiedValue(value);
                  setTimeout(() => setCopiedValue(v => v === value ? null : v), 1500);
                }}
                title={copiedValue === value ? "Copied!" : `Click to copy: ${value}`}
              >
                {copiedValue === value ? (
                  <>
                    <Check className="w-3 h-3 text-primary" />
                    <span className="text-primary">IP copied!</span>
                  </>
                ) : (
                  <>
                    <Tag className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{label}</span>
                  </>
                )}
              </span>
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
