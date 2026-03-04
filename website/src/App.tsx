import { Github, Heart, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import profileIcon from "@/assets/profile-icon.png";
import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/ProjectCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useGitHubStats } from "@/hooks/useGitHubStats";

const PROFILE_LINKS = [
  { href: "http://www.altcraft.net", label: "AltCraft", className: "hover:underline" },
  { href: "https://namemc.com/profile/EvModder", label: "NameMC", className: "hover:underline" },
  { href: "https://www.youtube.com/watch?v=LDU_Txk06tM", label: "🦀", className: "hover:opacity-80 transition-opacity" },
] as const;

interface CtaLink {
  href: string;
  label: string;
  Icon: LucideIcon;
  primary?: boolean;
}
const CTA_LINKS: CtaLink[] = [
  { href: "https://github.com/EvModder", label: "GitHub", Icon: Github, primary: true },
  { href: "https://dev.bukkit.org/members/evmodder/projects", label: "Bukkit", Icon: Package },
  { href: "https://ko-fi.com/evmodder", label: "Ko-fi", Icon: Heart },
];

interface CtaButtonsProps {
  containerClass?: string;
  buttonClass?: string;
}
const CtaButtons = ({
  containerClass = "flex items-center gap-3 flex-wrap",
  buttonClass = "",
}: CtaButtonsProps) => (
  <div className={containerClass}>
    {CTA_LINKS.map(({ href, label, Icon, primary }) => (
      <a
        key={href}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center gap-2 font-display font-medium rounded transition-colors px-4 py-2 text-sm ${
          primary
            ? "bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            : "bg-secondary text-secondary-foreground hover:bg-muted"
        } ${buttonClass}`}
      >
        <Icon className="w-4 h-4" />
        {label}
      </a>
    ))}
  </div>
);

const ProfileLinks = ({ className = "text-muted-foreground text-lg mb-0.5" }: { className?: string }) => (
  <p className={className}>
    {PROFILE_LINKS.map(({ href, label, className: linkClass }, i) => (
      <span key={href}>
        {i > 0 && <> &middot; </>}
        <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {label}
        </a>
      </span>
    ))}
  </p>
);

const App = () => {
  const stats = useGitHubStats();
  const [featured, others] = projects.reduce(
    ([f, o], project) => {
      (project.featured ? f : o).push(project);
      return [f, o];
    },
    [[] as typeof projects, [] as typeof projects],
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-9 md:py-11 lg:pt-14">
          <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between lg:gap-6">
            <div className="lg:flex-1 lg:min-w-0">
              <div className="flex items-start gap-5">
                <img
                  src={profileIcon}
                  alt="EvModder avatar"
                  className="w-16 h-16 rounded-lg pixel-border"
                  style={{ imageRendering: "pixelated" }}
                />
                <div className="min-w-0">
                  <h1 className="font-display font-bold text-foreground text-3xl md:text-4xl mb-2">EvModder</h1>
                  <ProfileLinks className="text-muted-foreground text-lg mb-0.5" />
                </div>
              </div>

              <div className="text-muted-foreground mt-3 mb-4 lg:mb-0 lg:max-w-none">
                <p>Welcome!</p>
                <p>Most stuff here is Minecraft-related, but occasionally I branch out :P</p>
                <p>
                  Feel free to ping me on{" "}
                  <a
                    href="http://discord.gg/urYADaHvQg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Discord
                  </a>
                </p>
              </div>
            </div>

            <aside className="w-full lg:w-[184px] lg:shrink-0 lg:self-stretch">
              <CtaButtons
                buttonClass="lg:w-full lg:py-2.5"
                containerClass="flex flex-wrap gap-3 lg:h-full lg:flex-col lg:items-center lg:justify-between"
              />
            </aside>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        <section className="mb-16">
          <h2 className="font-display text-sm font-bold text-primary uppercase tracking-widest mb-6">
            Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map((project, i) => (
              <div key={project.name} className="opacity-0 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <ProjectCard project={project} stats={stats[project.name]} />
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="font-display text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">
            More Projects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {others.map((project, i) => (
              <div
                key={project.name}
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: `${(featured.length + i) * 80}ms` }}
              >
                <ProjectCard project={project} stats={stats[project.name]} />
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs text-muted-foreground font-display">
          Compassion &middot; Conscientiousness &middot; Objectivism &middot; Geomorphology
        </div>
      </footer>
    </div>
  );
};

export default App;
