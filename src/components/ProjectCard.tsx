import { Star, GitFork, ExternalLink, Globe, Tag } from "lucide-react";
import type { Project } from "@/data/projects";
import { languageColors } from "@/data/projects";

interface Props {
  project: Project;
  stats?: { stars: number; forks: number; topics: string[]; description: string };
}

export function ProjectCard({ project, stats }: Props) {
  const stars = stats?.stars ?? project.stars;
  const forks = stats?.forks ?? project.forks;
  const topics = (stats?.topics?.length ? stats.topics : project.topics);

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-card rounded-lg p-5 card-hover pixel-border group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
          {project.name}
        </h3>
        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">
        {project.description}
      </p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-sm ${languageColors[project.language] || "bg-muted-foreground"}`} />
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
      {((project.subLinks && project.subLinks.length > 0) || (project.labels && project.labels.length > 0)) && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
          {project.subLinks?.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-display font-medium bg-secondary text-primary rounded hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Globe className="w-3 h-3" />
              {link.label}
            </a>
          ))}
          {project.labels?.map((label) => {
            const value = label.replace(/^[^:]+:\s*/, "");
            return (
              <span
                key={label}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-display font-medium bg-secondary text-muted-foreground rounded cursor-pointer hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigator.clipboard.writeText(value);
                }}
                title={`Click to copy: ${value}`}
              >
                <Tag className="w-3 h-3" />
                {label}
              </span>
            );
          })}
        </div>
      )}

      {topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {topics.slice(0, 6).map((topic) => (
            <span
              key={topic}
              className="px-2 py-0.5 text-[10px] font-display bg-secondary text-muted-foreground rounded"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
