import { Github, Heart, Package } from "lucide-react";
import profileIcon from "@/assets/profile-icon.png";
import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/ProjectCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useGitHubStats } from "@/hooks/useGitHubStats";

const Index = () => {
  const stats = useGitHubStats(projects.map((p) => p.name));
  const featured = projects.filter((p) => p.featured);
  const others = projects.filter((p) => !p.featured);

  return (
    <div className="min-h-screen bg-background">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Hero */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-10 md:py-14">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <img
              src={profileIcon}
              alt="EvModder avatar"
              className="w-20 h-20 rounded-lg border-2 border-border pixel-border"
              style={{ imageRendering: "pixelated" }}
            />
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                EvModder
              </h1>
              <p className="text-muted-foreground text-lg mb-0.5">
                <a
                  href="http://www.altcraft.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  AltCraft
                </a>
                {" "}&middot;{" "}
                <a
                  href="https://namemc.com/profile/EvModder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  NameMC
                </a>
                {" "}&middot;{" "}
                <a
                  href="https://www.youtube.com/watch?v=LDU_Txk06tM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  🦀
                </a>
              </p>
              <div className="text-muted-foreground mb-4 mt-3 max-w-lg">
                <p>Welcome!</p>
                <p>Most stuff here is Minecraft-related.</p>
                <p>
                  Feel free to reach out on{" "}
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
              <div className="flex items-center gap-3 flex-wrap">
                <a
                  href="https://github.com/EvModder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-display font-medium bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
                <a
                  href="https://dev.bukkit.org/members/evmodder/projects"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-display font-medium bg-secondary text-secondary-foreground rounded hover:bg-muted transition-colors"
                >
                  <Package className="w-4 h-4" />
                  Bukkit
                </a>
                <a
                  href="https://ko-fi.com/evmodder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-display font-medium bg-secondary text-secondary-foreground rounded hover:bg-muted transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  Ko-fi
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        {/* Featured Projects */}
        <section className="mb-16">
          <h2 className="font-display text-sm font-bold text-primary uppercase tracking-widest mb-6">
            Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map((project, i) => (
              <div
                key={project.name}
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <ProjectCard project={project} stats={stats[project.name]} />
              </div>
            ))}
          </div>
        </section>

        {/* Other Projects */}
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

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs text-muted-foreground font-display">
          EvModder &middot; 773 contributions in the last year &middot; Port Lockroy
        </div>
      </footer>
    </div>
  );
};

export default Index;
