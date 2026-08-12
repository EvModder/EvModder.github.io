import profileIcon from "@/assets/profile-icon.png";
import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/ProjectCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useGitHubStats } from "@/hooks/useGitHubStats";
import { LinkIcon } from "@/components/LinkIcon";

interface ProfileLink {
  href: string;
  label: string;
  className: string;
  iconOnly?: boolean;
  title?: string;
}
const PROFILE_LINKS: readonly ProfileLink[] = [
  { href: "http://www.altcraft.net", label: "AltCraft", className: "hover:underline" },
  { href: "https://namemc.com/profile/EvModder", label: "NameMC", className: "hover:underline" },
  { href: "https://www.youtube.com/watch?v=LDU_Txk06tM", label: "🦀", className: "hover:opacity-80 transition-opacity" },
];

interface CtaLink {
  href: string;
  label: string;
  title?: string;
  primary?: boolean;
}
const CTA_LINKS: CtaLink[] = [
  { href: "https://github.com/EvModder", label: "GitHub", title: "All my projects", primary: true },
  { href: "https://dev.bukkit.org/members/evmodder/projects", label: "Bukkit", title: "My published plugins" },
  { href: "https://ko-fi.com/evmodder", label: "Ko-fi", title: "Buy me a coffee!" },
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
    {CTA_LINKS.map(({ href, label, title, primary }) => (
      <a
        key={href}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
        className={`inline-flex items-center justify-center gap-2 font-display font-medium rounded transition-colors px-4 py-2 text-sm ${
          primary
            ? "bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            : "bg-secondary text-secondary-foreground hover:bg-muted"
        } ${buttonClass}`}
      >
        <LinkIcon name={label} className="w-4 h-4 shrink-0" />
        {label}
      </a>
    ))}
  </div>
);

const ProfileLinks = ({ className = "text-muted-foreground text-lg mb-0.5" }: { className?: string }) => (
  <p className={className}>
    {PROFILE_LINKS.map(({ href, label, className: linkClass, iconOnly, title }, i) => (
      <span key={href}>
        {i > 0 && <> &middot; </>}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
          title={title}
          aria-label={title || label}
        >
          {iconOnly ? <LinkIcon name={label} className="inline h-[18px] w-[18px] align-[-2px]" /> : label}
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
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex flex-col min-[69rem]:flex-row min-[69rem]:items-stretch min-[69rem]:justify-between min-[69rem]:gap-6">
            <div className="min-[69rem]:flex-1 min-[69rem]:min-w-0">
              <div className="flex max-w-[calc(100%-4rem)] items-start gap-5 min-[69rem]:max-w-none">
                <img
                  src={profileIcon}
                  alt="EvModder avatar"
                  className="w-16 h-16 rounded-lg pixel-border"
                  style={{ imageRendering: "pixelated" }}
                />
                <div className="min-w-0 min-h-16 flex flex-col justify-between">
                  <h1 className="font-display font-bold text-foreground text-3xl leading-none md:text-4xl">EvModder</h1>
                  <ProfileLinks className="text-lg leading-none text-muted-foreground" />
                </div>
              </div>

              <div className="mt-3 text-muted-foreground min-[69rem]:max-w-none">
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

            <aside className="mt-4 w-full min-[69rem]:mt-0 min-[69rem]:w-[184px] min-[69rem]:shrink-0 min-[69rem]:self-stretch">
              <CtaButtons
                buttonClass="min-[69rem]:w-full min-[69rem]:py-2.5"
                containerClass="flex flex-wrap gap-3 min-[69rem]:h-full min-[69rem]:flex-col min-[69rem]:items-center min-[69rem]:justify-between"
              />
            </aside>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-10 pb-6">
        <section className="mb-10">
          <h2 className="font-display text-sm font-bold text-primary uppercase tracking-widest mb-5">
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
          <h2 className="font-display text-sm font-bold text-muted-foreground uppercase tracking-widest mb-5">
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
