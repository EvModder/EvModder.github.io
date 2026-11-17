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
  { href: "https://www.youtube.com/@evmodder", label: "YouTube", title: "My YouTube channel" },
  { href: "https://ko-fi.com/evmodder", label: "Ko-fi", title: "Buy me a coffee!" },
];

const CtaButtons = () => (
  <div className="grid grid-cols-2 gap-3 min-[383px]:grid-cols-4 min-[69rem]:h-full min-[69rem]:grid-cols-1 min-[69rem]:grid-rows-4 min-[69rem]:gap-2">
    {CTA_LINKS.map(({ href, label, title, primary }) => (
      <a
        key={href}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
        className={`inline-flex h-9 w-full items-center justify-center gap-2 rounded px-4 py-2 font-display text-sm font-medium min-[383px]:gap-1 min-[383px]:px-0.5 min-[383px]:text-xs min-[34rem]:gap-2 min-[34rem]:px-4 min-[34rem]:text-sm min-[69rem]:grid min-[69rem]:h-full min-[69rem]:grid-cols-[1rem_4rem] min-[69rem]:py-0 min-[69rem]:text-left ${
          primary
            ? "bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            : "bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
        }`}
      >
        <LinkIcon name={label} className="size-4 shrink-0" />
        {label}
      </a>
    ))}
  </div>
);

const ProfileLinks = () => (
  <p className="text-lg leading-none text-muted-foreground">
    {PROFILE_LINKS.map(({ href, label, className }, i) => (
      <span key={href}>
        {i > 0 && <> &middot; </>}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {label}
        </a>
      </span>
    ))}
  </p>
);

const featured = projects.filter(project => project.featured);
const others = projects.filter(project => !project.featured);

const App = () => {
  const stats = useGitHubStats();

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-2 right-2 z-50">
        <ThemeToggle />
      </div>

      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex flex-col min-[69rem]:flex-row min-[69rem]:items-stretch min-[69rem]:justify-between min-[69rem]:gap-6">
            <div className="min-[69rem]:flex-1 min-[69rem]:min-w-0">
              <div className="flex max-w-[calc(100%-4rem)] items-start gap-5 min-[69rem]:max-w-none">
                <img
                  src={profileIcon}
                  alt="ÉvModder avatar"
                  width={64}
                  height={64}
                  className="size-16 rounded-lg pixel-border"
                  style={{ imageRendering: "pixelated" }}
                />
                <div className="min-w-0 min-h-16 flex flex-col justify-between">
                  <h1 className="font-display font-bold text-foreground text-3xl leading-none md:text-4xl">ÉvModder</h1>
                  <ProfileLinks />
                </div>
              </div>

              <div className="mt-3 text-muted-foreground min-[69rem]:max-w-none">
                <p>Welcome!</p>
                <p>Most stuff here is Minecraft-related, but occasionally I branch out :P</p>
                <p>
                  Feel free to ping me on{" "}
                  <a
                    href="https://discord.gg/urYADaHvQg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link hover:underline"
                  >
                    Discord
                  </a>
                </p>
              </div>
            </div>

            <aside className="mt-4 w-full min-[69rem]:mt-0 min-[69rem]:w-[184px] min-[69rem]:shrink-0 min-[69rem]:self-stretch">
              <CtaButtons />
            </aside>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-10 pb-6">
        <section className="mb-10">
          <h2 className="font-display text-sm font-bold text-foreground uppercase tracking-widest mb-5">
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
          <h2 className="font-display text-sm font-bold text-subheading uppercase tracking-widest mb-5">
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
