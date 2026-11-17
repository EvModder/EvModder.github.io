import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

function setupHtml(html: string) {
  return html.replaceAll("EvModder's project portfolio — Minecraft plugins and more",
    "The Minecraft mods and settings I use on 2b2t.")
    .replace("<title>EvModder</title>", "<title>Év’s Setup</title>")
    .replace('property="og:title" content="EvModder"', 'property="og:title" content="Év’s Setup"')
    .replace('href="https://evmodder.net/"', 'href="https://evmodder.net/my-minecraft-setup/"');
}

export default defineConfig({
  build: { target: "esnext" },
  plugins: [react(), tailwindcss(), {
    name: "minecraft-setup-page",
    // Dev server: requests fall back to /index.html, so match on the URL that was asked for.
    transformIndexHtml(html, context) {
      const path = (context.originalUrl ?? context.path).replace(/[?#].*/, "")
        .replace(/\/+/g, "/").replace(/\/index\.html$/, "/").replace(/\/$/, "");
      return path === "/my-minecraft-setup" ? setupHtml(html) : html;
    },
    async writeBundle(options, bundle) {
      const index = bundle["index.html"];
      if (index?.type !== "asset") throw new Error("Missing portfolio index.html");
      const directory = resolve(options.dir!, "my-minecraft-setup");
      await mkdir(directory, { recursive: true });
      await writeFile(resolve(directory, "index.html"), setupHtml(String(index.source)));
      // Real directory indexes avoid GitHub Pages' 404 fallback on direct visits.
      await writeFile(resolve(options.dir!, "404.html"), String(index.source));
    },
  }],
  resolve: { tsconfigPaths: true },
  server: {
    host: "::",
    port: 8080,
  },
});
